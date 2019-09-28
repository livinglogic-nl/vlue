const log = require('./../log');
const vuelSettings = require('./../vuel-settings');
const pathToRegexp = require('path-to-regexp');
const header = (name, value) => ({name,value});

module.exports = class PageExtension {
    async init(page) {
        let xhrStack = [];
        let xhrPointer = 0;
        this.xhr = {
            clear() {
                xhrStack = [];
            },
            push(obj) {
                xhrStack.push(obj);
            },

            saveState() {
                xhrPointer = xhrStack.length;
            },
            restoreState() {
                if(xhrStack.length > xhrPointer) {
                    xhrStack.splice(xhrPointer, xhrStack.length-xhrPointer)
                }
            },
        };


        const client = await page.target().createCDPSession();
        await client.send('Fetch.enable');
        client.on('Fetch.requestPaused', async(obj) => {
            const { requestId } = obj;
            const url = obj.request.url.replace(vuelSettings.domain, '');
            for(let i=xhrStack.length-1; i>=0; i--) {
                const entry = xhrStack[i][url];
                if(entry !== undefined) {
                    const responseCode = 200;
                    const responseHeaders = [
                        header('Access-Control-Allow-Origin', '*'),
                    ];


                    let response;
                    if(entry instanceof Object) {
                        response = entry;
                    } else if(entry instanceof Function) {
                        response = entry();
                    }

                    if(response instanceof Object) {
                        response = JSON.stringify(response);
                    }

                    const body = Buffer.from(response).toString('base64');
                    client.send('Fetch.fulfillRequest', {
                        requestId,
                        responseCode,
                        responseHeaders,
                        body,
                    });
                    return;
                }
            }
            try {
                await client.send('Fetch.continueRequest', { requestId });
            } catch(e) {
                log.error('Could not continueRequest');
            }
        });
    }

    async route(path = '') {
        const url = vuelSettings.domain + '/#/' + path;
        await this.goto(url);
        await this.evaluate(() => {
            return new Promise(ok => {
                const recurseReset = (node) => {
                    if(node.resetState) {
                        node.resetState();
                    }
                    node.$children.map(recurseReset);
                }
                const app = document.querySelector('#app').__vue__;
                recurseReset(app);
                window.scrollTo(0,0);
                requestAnimationFrame(ok);
            });
        });
    }

    async vclick(selector) {
        await this.evaluate((sel) => {
            return new Promise(ok => {
                const go = () => {
                    const result = document.querySelector(sel);
                    if(result) {
                        requestAnimationFrame(() => {
                            result.click();
                            ok();
                        });

                    } else {
                        console.log('failed...');
                        setTimeout(go, 40);
                    }
                }
                go();
            });
        },selector);
    }

    async vwait(selector) {
        return this.evaluate((sel) => {
            return new Promise(ok => {
                const go = () => {
                    const result = document.querySelector(sel);
                    if(result) {
                        ok(result);
                    } else {
                        setTimeout(go, 40);
                    }
                }
                go();
            });
        },selector);
    }

    async vtry(callback) {
        const maxRuns = 5;
        const func = Function(`
return new Promise((ok,fail) => {
    let runs = 0;
    const maxRuns = ${maxRuns};
    const callback = ${callback.toString()};
    const run = () => {
        runs++;
        try {
            let result = callback();
            ok(result);
        } catch(e) {
            if(runs >= maxRuns) {
                fail(e);
            } else {
                setTimeout(run, 40); 
            }
        }
    }
    run();
});
`);
        return this.evaluate(func);

    }
}
