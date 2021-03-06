const log = require('./log');
const VlueStream = require('./vlue-stream');
const assert = require('assert');
const JSONStream = require('json-stream');
const { EventEmitter } = require('events');
const child_process = require('child_process');
const blueTape = require('blue-tape');

const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const testDir = path.join(__dirname, '..', 'test');

const { killDev } = require('./test/run');



(async() => {
    const targetDir = '/tmp/vlue-test';
    if(!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir);
    }


    let files = fs.readdirSync(testDir).filter(f => f.includes('.spec.js'));
    const [,,specific] = process.argv;
    if(specific) {
        files = [ specific + '.spec.js' ];
    }
    let only = null;
    for await(let file of files) {
        console.log(chalk.blue(file));

        let tests = [];
        const url = require.resolve( path.join(testDir, file) );
        const testProxy = (name, callback) => {
            tests.push({ name, callback });
        };
        testProxy.only = (name, callback) => {
            only = ({name, callback});
        }

        require(url)({
            test: testProxy,
        });

        if(only) {
            tests = [ only ];
        }

        const timeout = 5000;
        const test = blueTape.createHarness();
        test.createStream().pipe(process.stdout);
        for await(let obj of tests) {
            let timeoutId;
            await Promise.race([
                new Promise(ok => {
                    test(obj.name, async(t)=> {
                        await obj.callback(t);
                        ok();
                    });
                }),
                new Promise( (ok,fail) => {
                    timeoutId = setTimeout(fail,timeout);
                }),
            ]).catch(e => {
                log.error('Timeout of '+timeout+'ms passed');
            });
            clearTimeout(timeoutId);
        }
        if(only) {
            break;
        }
    }
    killDev();
})();


