
const child_process = require('child_process');

const puppeteer = require('puppeteer-core');

const devurl = 'http://localhost:8080';
let browser; 
let pagePromise = null;
const startup = (async() => {
    try {
        browser = await puppeteer.connect({
            browserURL: 'http://localhost:9222',
            defaultViewport: null,
        });
    } catch(e) {
        console.log(e);
        console.log('error connecting to chrome, please use remote-debugging-port 9222');
    }
})();



const getPage = async() => {
    if(!pagePromise) {
        pagePromise = new Promise(async(ok) => {
            await startup;

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
                await page.goto(url);
            }
            console.log('found');
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

    async rescript() {
        (await getPage()).evaluate(() => {
            try {
                Object.keys(vuelInstanced).forEach(key => {
                    if(key.indexOf('src') === 0) {
                        delete vuelInstanced[key];
                    }
                });
            } catch(e) {
            }
            const reload = (name) => {
                try {
                    var a = document.querySelector('script[src*='+name+']');
                    document.body.removeChild(a);
                } catch(e) {
                }

                var b = document.createElement('script');
                b.src = name + '.js';
                document.body.appendChild(b);
            }

            // reload('vendor');
            reload('index');
        });
    },

    async restyle() {
        (await getPage()).evaluate(() => {
            try {
                var a = document.querySelector('link[data-name=vuel]');
                document.head.removeChild(a);
            } catch(e) {
            }
            var b = document.createElement('link');
            b.rel = 'stylesheet';
            b.href = 'style.css';
            b.dataset.name = 'vuel';
            document.head.appendChild(b);
        });
    },
};
