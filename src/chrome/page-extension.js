const fs = require('fs');
const path = require('path');
const log = require('./../log');
const vuelSettings = require('./../vuel-settings');
const pathToRegexp = require('path-to-regexp');
const header = (name, value) => ({name,value});

const stream = require('stream');
const pngAsync = require('png-async');

const vtry = async(page, callback, ...rest) => {
        const maxRuns = 5;
        const func = Function('rest', `
return new Promise((ok,fail) => {
    let runs = 0;
    const maxRuns = ${maxRuns};
    const callback = ${callback.toString()};
    const run = async() => {
        runs++;
        try {
            let result = await callback(...rest);
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
    return page.evaluate(func, rest);
}

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

            reset() {
                const xhrDir = path.join(process.cwd(), 'mock/xhr'); 
                const xhrIndex = path.join(xhrDir,'index.js');
                if(!fs.existsSync(xhrIndex)) {
                    log.tip('You can mock XHR requests by adding mock/xhr/index.js');
                    return;
                }

                // TODO: smarter way to clear xhr cache by dependency map
                Object.keys(require.cache).forEach(key => {
                    if(key.includes('mock/xhr')) {
                        delete require.cache[key];
                    }
                });

                this.clear();
                const index = require(xhrIndex);
                this.xhr.push(index);
            }
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
                // sometimes it fails, but does not seem to matter much
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
        return vtry(this, (sel) => {
            document.querySelector(sel).click();
        }, selector);
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
        return vtry(this, callback);
    }

    async vcolor(x,y) {
        return new Promise(async(ok) => {
            const shot = await this.screenshot({
                clip: { x, y, width: 1, height: 1 },
            });

            const pass = new stream.PassThrough();
            pass.end( shot );

            const image = pngAsync.createImage({ filterType: 4 });
            image.on('parsed', () => {
                const [red, green, blue, alpha ] = image.data.slice(0,4);
                ok({
                    red,
                    green,
                    blue,
                    alpha,
                });
            });
            pass.pipe(image);
        });
    }
}
