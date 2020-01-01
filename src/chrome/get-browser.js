module.exports = async(port) => {
    try {
        browser = await puppeteer.connect({
            browserURL: 'http://localhost:'+port,
            defaultViewport: null,
        });
    } catch(e) {
        const loc = require('chrome-location');
        browser = await puppeteer.launch({
            executablePath: loc,
            userDataDir: '/tmp/vlue-data-dir',
            headless: false,
            defaultViewport: null,
            args: [
                '-no-first-run',
            ],
        });
    }
}

