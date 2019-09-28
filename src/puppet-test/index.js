const fs = require('fs');
const path = require('path');
const log = require('./../log');
const testLogger = require('./test-logger');
const chrome = require('./../chrome');
const localSettings = require('./../local-settings');
const blueTape = require('blue-tape');
const chalk = require('chalk');
const assert = require('assert');

const { installMouseHelper, uninstallMouseHelper } = require('./install-mouse-helper');

const puppetDir = 'puppet';
const fitsMap = {};
module.exports = {
    async runTests(puppetFiles) {
        const interval = localSettings.puppetInterval;

        const page = await chrome.getPage();
        // await installMouseHelper(page);
        await page.setInterval(interval);

        const suites = [];
        global.describe = (name, handler) => {
            suites.push( { name, handler } );
        }
        puppetFiles.forEach(file => {
            const url = path.join(process.cwd(), file);
            delete require.cache[url];
            return require(url);
        });

        const test = blueTape.createHarness();
        for await(let suite of suites) {
            let its = [];
            let fits = [];
            global.it = (name, handler) => { its.push({ name, handler }); }
            global.fit = (name, handler) => { fits.push({ name, handler }); }
            suite.handler();

            if(fits.length) {
                its = fits;
            }

            log.info('Running suite "' + suite.name+'"');
            test.createStream({ objectMode: true }).on('data', testLogger);
            for await(let it of its) {
                await new Promise(ok => {
                    test(it.name, async(t) => {
                        await it.handler({
                            t,
                            page,
                        });
                        ok();
                    });
                });
            }
        }
        // await uninstallMouseHelper(page);
    },

    async initDev() {
        const puppetFiles = fs.readdirSync(puppetDir);
        puppetFiles.forEach(file => {
            this.registerFits(path.join(puppetDir,file));
        });
    },

    async registerFits(file) {
        const cnt = await fs.readFileSync(file).toString();
        const matches = [...cnt.matchAll(/[\s](fit)\(/g)];
        fitsMap[file] = matches.length;
    },

    async runDev(roots) {
        const changedPuppets = roots.filter(f => f.indexOf(puppetDir) === 0);
        if(changedPuppets.length) {
            await Promise.all(changedPuppets.map(file => {
                return this.registerFits(file);
            }));
        }
        const focused = Object.entries(fitsMap)
            .filter(entry => entry[1]>0)
            .map(entry => entry[0]);
        if(focused.length) {
            await this.runTests(focused);
        }
    }
}
