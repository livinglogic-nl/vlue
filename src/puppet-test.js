const log = require('./log');
const blueTape = require('blue-tape');
const chalk = require('chalk');
const assert = require('assert');
const chrome = require('./chrome');
const puppetTestLogger = require('./puppet-test-logger');


module.exports = {
    async runTests(urls) {
        const page = await chrome.getPage();

        const map = {
            async route(path = '') {
                const url = 'http://localhost:8080' + '/#/' + path;
                return this.goto(url);
            },
        }
        const proxy = new Proxy(page, {
            get(obj,key) {
                if(obj[key]) {
                    return obj[key];
                }
                return map[key];
            },
        });

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

            log.info('Running suite "' + suite.name+'"');
            test.createStream({ objectMode: true }).on('data', puppetTestLogger);
            for await(let it of its) {
                await new Promise(ok => {
                    test(it.name, async(t) => {
                        await it.handler({
                            t,
                            page: proxy,
                        });
                        ok();
                    });
                });
            }
        }
    }
}
