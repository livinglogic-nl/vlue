const assert = require('assert');
const JSONStream = require('json-stream');
const { EventEmitter } = require('events');
const child_process = require('child_process');
const blueTape = require('blue-tape');

const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const testDir = path.join(__dirname, '..', 'test');
const { launchProject } = require('../src/test-suite');

class VuelStream extends EventEmitter {
    constructor(ps) {
        super();

        let buffer = '';

        let tries = 0;
        ps.stdout.on('data', (buf) => {
            process.stdout.write(buf);
            buffer += buf.toString();
            let lastIndex = -1;
            while(1) {
                let idx = buffer.indexOf('}', lastIndex+1);
                if(idx !== -1) {
                    idx++;
                    try {
                        const str = buffer.substr(0,idx);
                        let obj = JSON.parse(str);
                        tries = 0;
                        buffer = buffer.substr(idx).trim();
                        if(this.onObject) {
                            this.onObject(obj);
                        }
                        lastIndex = -1;
                    } catch(e) {
                        lastIndex = idx;

                    }
                } else {
                    break;
                }
            }
        });
        ps.stderr.on('data', (buf) => {
            // console.log('err',buf.toString());
        });
    }

    waitForError(message) {
        return new Promise(ok => {
            this.onObject = (obj) => {
                if(obj.type === 'error' && obj.message === message) {
                    this.onObject = null;
                    ok();
                }
            };
        });
    }

    waitForIdle() {
        return new Promise(ok => {
            this.onObject = (obj) => {
                if(obj.message === 'idle') {
                    this.onObject = null;
                    ok();
                }
            };
        });
    }

    waitForMessage(like) {
        return new Promise(ok => {
            this.onObject = (obj) => {
                try {
                    assert.deepStrictEqual(obj,like);
                    this.onObject = null;
                    ok();
                } catch(e) {
                }
            }
        });
    }
}

(async() => {
    const targetDir = '/tmp/vuel-test';
    // child_process.execSync('rm -rf '+targetDir);
    if(!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir);
    }

    const vuelIndex = __dirname + '/../index.js';
    const ps = child_process.spawn('node', [ vuelIndex ], { cwd:targetDir });
    const vuelStream = new VuelStream(ps);

    let files = fs.readdirSync(testDir).filter(f => f.includes('.spec.js'));
    const [,,specific] = process.argv;
    if(specific) {
        files = [ specific + '.spec.js' ];
    }
    for await(let file of files) {
        console.log(chalk.blue(file));

        let tests = [];
        let only = null;
        const url = require.resolve( path.join(testDir, file) );
        const testProxy = (name, callback) => {
            tests.push({ name, callback });
        };
        testProxy.only = (name, callback) => {
            only = ({name, callback});
        }


        require(url)({
            launchProject,
            vuelStream,
            test: testProxy,
        });

        if(only) {
            tests = [ only ];
        }

        const test = blueTape.createHarness();
        test.createStream().pipe(process.stdout);
        for await(let obj of tests) {
            await new Promise(ok => {
                test(obj.name, async(t)=> {
                    await obj.callback(t);
                    ok();
                });
            });
        }
    }
    // ps.kill('SIGINT');
})();


