
const child_process = require('child_process');
const puppeteer = require('puppeteer-core');
const detect = require('detect-port');
const devurl = 'http://localhost:8080';
let browser; 
let pagePromise = null;

const targetPort = 9222;
const startup = async() => {
    try {
        browser = await puppeteer.connect({
            browserURL: 'http://localhost:'+targetPort,
            defaultViewport: null,
        });
    } catch(e) {
        console.log('Could not connect to chrome at', targetPort, 'trying to launch');
        const loc = require('chrome-location');
        child_process.spawn(loc, [
            '--remote-debugging-port='+targetPort,
        ], {
            detached: true,
        });

        let running = await waitForPort();
        if(running) {
            await startup();
        } else {
            console.log('Could not connect to chrome at', targetPort, 'exiting...');
            process.exit();
        }
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

module.exports = {
    async reload() {
        (await getPage()).reload();
    },

    async rescript(file) {
        (await getPage()).evaluate((file) => {
            // if(vuelInstanced) {
            //     Object.keys(vuelInstanced).forEach(key => {
            //         if(key.includes('/store')) {
            //             return;
            //         } 
            //         if(file && key !== file) {
            //             return;
            //         }
            //         if(key.indexOf('src') === 0) {
            //             delete vuelInstanced[key];
            //         }
            //     });
            // }

            let name = 'index';
            try {
                var a = document.querySelector('script[src*='+name+']');
                document.body.removeChild(a);
            } catch(e) {
            }

            var b = document.createElement('script');
            b.src = name + '.js';
            document.body.appendChild(b);
        },file);
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
    },
};
