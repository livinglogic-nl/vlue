const log = require('./log');
const localSettings = require('./local-settings');

const child_process = require('child_process');
const puppeteer = require('puppeteer-core');
const detect = require('detect-port');
const devurl = 'http://localhost:8080';


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
    if(!pagePromise) {
        pagePromise = new Promise(async(ok) => {
            await startup();

            let page;
            let pages = await browser.pages();
            for await(let p of pages) {
                let url = p.url();
                if(url.includes('chrome-devtools://')) { continue; }
                if(url.includes(devurl)) {
                    page = p;
                    break;
                }
            }
            if(!page) {
                page = await browser.newPage();
                await page.goto(devurl);
            }
            await page.setCacheEnabled(false);
            ok(page);
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

    async rescript(changes, filesChanged) {
        const page = await getPage();

        //clear old instances
        await page.evaluate((names) => {
            names.forEach(name => {
                delete vuelInstanced[name];
            });
        }, filesChanged);
        await page.evaluate(changes.source);

        const name = filesChanged[0];
        const isVueComponent = filesChanged.length === 1 && name.includes('.vue');
        console.log(name, isVueComponent);
        if(isVueComponent) {
            await page.evaluate((name) => {
                console.log('reloading', name);
                const api = vuelImport('vue-hot-reload-api');
                api.reload(name, vuelImport(name));
            },name);
        } else {
            await page.evaluate(() => {
                vuelImport('src/index.js');
            });
        }
        handleWaiting();
    },

    async restyle(changes) {
        const page = await getPage();
        await Promise.all(
            changes.styles.map(s => page.evaluate(({name,str}) => {
                var a = document.querySelector('style[data-name="'+name+'"]');

                var b = document.createElement('style');
                b.dataset.name = name;
                b.innerHTML = str;
                if(a) {
                    document.head.insertBefore(b,a);
                    document.head.removeChild(a);
                    console.log('replaced');
                } else {
                    document.head.appendChild(b);
                }
            }, s))
        );
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
