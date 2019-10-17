const extendPage = require('./extend-page');
const vuelSettings = require('../vuel-settings');
const puppeteer = require('puppeteer-core');
const log = require('../log');

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
    }
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


module.exports = {
    getPage,
    browser,
};
