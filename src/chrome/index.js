const extendPage = require('./extend-page');
const vuelSettings = require('./../vuel-settings');
const puppeteer = require('puppeteer-core');
const log = require('./../log');

let browser; 
let pagePromise = null;
let shouldClose;

const targetPort = 9222;
const startup = async() => {
    try {
        browser = await puppeteer.connect({
            browserURL: 'http://localhost:'+targetPort,
            defaultViewport: null,
        });
        shouldClose = false;
    } catch(e) {
        log.info(`Could not connect to chrome at ${targetPort} trying to launch`);
        const loc = require('chrome-location');
        browser = await puppeteer.launch({
            executablePath: loc,
            userDataDir: '/tmp/vuel-data-dir',
            headless: false,
            defaultViewport: null,
            args: [
                '-no-first-run',
            ],

        });
        shouldClose = true;
    }
}

const waitForPort = async() => {
    for(let i=0; i<100; i++) {
        const port = await detect(targetPort);
        process.stdout.write('.');
        if(port !== targetPort) {
            return true;
        }
        await new Promise(ok => setTimeout(ok,40));
    }
    return false;
}


const getPage = async() => {
    const domain = vuelSettings.domain;
    if(!pagePromise) {
        pagePromise = new Promise(async(ok) => {
            await startup();

            let page;
            let pages = await browser.pages();
            for await(let p of pages) {
                let url = p.url();
                if(url.includes('chrome-devtools://')) { continue; }
                if(url.includes('chrome-error') || url.includes(domain)) {
                    page = p;
                    break;
                }
            }
            if(!page) {
                page = await browser.newPage();
                await page.goto(domain);
            }

            await page.setCacheEnabled(false);
            const result = await extendPage(page);
            ok(result);
        });
    }
    return pagePromise;
}


let waiting = [];


const handleWaiting = () => {
    waiting.forEach(func => func());
    waiting = [];
}

module.exports = {
    getPage,

    waitForUpdate() {
        const p = new Promise(ok => {
            waiting.push(() => {
                setTimeout(ok, 40);
            });
        });
        return p;
    },

    async reload() {
        (await getPage()).reload();
        handleWaiting();
    },

    async hot(sourceBundler) {
        const page = await getPage();
        const scripts = sourceBundler.scripts;

        if(scripts.length) {
            const mustRunRoot = scripts.find(entry => entry.updateMethod === undefined);
            const toClear = mustRunRoot ? Object.values(sourceBundler.scriptMap) : scripts;

            //clear old instances
            await page.evaluate((names) => {
                names.forEach(name => {
                    delete vuelInstanced[name];
                });
            }, toClear.map(entry => entry.name));

            const script = sourceBundler.partialScript;
            await page.evaluate(script);

            if(mustRunRoot) {
                log.trace('cold reload');
                await page.evaluate(() => {
                    delete vuelInstanced['vue-hot-reload-api'];
                    vuelImport('src/index.js');
                });
            } else {
                await Promise.all(scripts.map(async(entry) => {
                    log.trace('hot reload', entry.url, entry.updateMethod);
                    return page.evaluate((name, updateMethod) => {
                        const api = vuelImport('vue-hot-reload-api');
                        if(updateMethod === 'vue.rerender') {
                            api.rerender(name, vuelImport(name));
                        } else {
                            api.reload(name, vuelImport(name));
                        }
                    }, entry.name, entry.updateMethod);
                }));
            }
        }
        const styles = sourceBundler.styles;
        if(styles.length) {
            await Promise.all(
                styles.map(s => page.evaluate(({name,code}) => {
                    // console.log('replacing',name);
                    var a = document.querySelector('style[data-name="'+name+'"]');
                    var b = document.createElement('style');
                    b.dataset.name = name;
                    b.innerHTML = code;
                    if(a) {
                        const p = a.parentElement;
                        p.insertBefore(b,a);
                        p.removeChild(a);
                    } else {
                        document.head.appendChild(b);
                    }
                }, s))
            );
        }
        handleWaiting();
    },

    async stop() {
        if(shouldClose) {
            await browser.close();
        } else {
            await browser.disconnect();
        }
        browser = null;
        pagePromise = null;

    },
};
