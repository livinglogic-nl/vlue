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

        for await(let suite of suites) {
            let its = [];
            global.it = (name, handler) => {
                its.push({ name, handler });
            }
            suite.handler();

            console.log(chalk.bold(suite.name));
            for await(let it of its) {
                console.log(' >',it.name);
                await it.handler({
                    t: assert,
                    page,
                });
            }
            console.log(chalk.green('passed'));
        }
    }
}
