const blueTape = require('blue-tape');
const chalk = require('chalk');
const assert = require('assert');
const chrome = require('./chrome');

module.exports = {
    async runTests(urls) {
        const page = await chrome.getPage();

        const suites = [];
        global.describe = (name, handler) => {
            suites.push( { name, handler } );
        }
        urls.forEach(url => {
            delete require.cache[require.resolve(url)];
            return require(url);
        });

        const test = blueTape.createHarness();
        for await(let suite of suites) {
            let its = [];
            global.it = (name, handler) => {
                its.push({ name, handler });
            }
            suite.handler();

            console.log(chalk.bold(suite.name));
            test.createStream().pipe(process.stdout);
            for await(let it of its) {
                await new Promise(ok => {
                    test(it.name, async(t) => {
                        await it.handler({
                            t,
                            page
                        }).catch(e => {
                        });
                        ok();
                    });
                });
            }
        }
    }
}
