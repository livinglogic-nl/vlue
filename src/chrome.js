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
        console.log('Could not connect to chrome at', targetPort, 'trying to launch');
        const loc = require('chrome-location');
        browser = await puppeteer.launch({
            executablePath: loc,
            userDataDir: '/tmp/vuel-data-dir',
            headless: false,
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
    },

    async rescript(file) {
        await (await getPage()).evaluate((file) => {
            if(file) {
                // file could be specified, if so only replace that one
                delete vuelInstanced[file];
            } else {
                Object.keys(vuelInstanced).forEach(key => {
                    // TODO: always keep store alive?
                    if(key.includes('/store')) return;
                   
                    // only remove non-vendor
                    if(key.indexOf('src') === 0) {
                        console.log('refreshing', key);
                        delete vuelInstanced[key];
                    }
                });
            }


            const name = 'index';
            try {
                const a = document.querySelector('script[src*='+name+']');
                document.body.removeChild(a);
            } catch(e) {
            }

            const b = document.createElement('script');
            b.src = name + '.js';
            document.body.appendChild(b);
        },file).catch(e => {
            console.log('session closed?');
        });

        waiting.forEach(func => func());
        waiting = [];
    },

    async restyle() {
        (await getPage()).evaluate(() => {
            var a = document.querySelector('link[data-name=vuel]');

            var b = document.createElement('link');
            b.rel = 'stylesheet';
            b.href = 'style.css';
            b.dataset.name = 'vuel';
            document.head.appendChild(b);

            if(a) {
                document.head.removeChild(a);
            }
        });
        waiting.forEach(func => func());
        waiting = [];
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
