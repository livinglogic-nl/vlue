
const child_process = require('child_process');

const puppeteer = require('puppeteer-core');


let browser; 
let page;
const startup = (async() => {
    browser = await puppeteer.connect({
        browserURL: 'http://localhost:9222',
        defaultViewport: null,
    });
    let pages = await browser.pages();
    for await(let p of pages) {
        let url = p.url();
        if(url.includes('chrome-devtools://')) { continue; }
        if(url.includes('http://localhost:8080')) {
            page = p;
            break;
        }

    }
    await page.setCacheEnabled(false);
})();

module.exports = {
    async reload() {
        await startup;
        await page.reload();
    },

    async rescript() {
        await startup;
        await page.evaluate(() => {
            Object.keys(vuelInstanced).forEach(key => {
                if(key.indexOf('src') === 0) {
                    delete vuelInstanced[key];
                }
            });
            const reload = (name) => {
                try {
                    var a = document.querySelector('script[src*='+name+']');
                    console.log(a);
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
        await startup;
        await page.evaluate(() => {
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
