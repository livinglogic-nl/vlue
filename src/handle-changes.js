const chrome = require('./chrome');
const fs = require('fs');
const path = require('path');
const localSettings = require('./local-settings');
const puppetTest = require('./puppet-test');

module.exports = (changes) => {
    const { reload } = localSettings;

    if(Object.keys(changes).length === 0) {
        chrome.rescript();
        chrome.restyle();
    } else {
        if(changes.source !== undefined || changes.vendor) {
            chrome.rescript(changes.source);
        }
        if(changes.style) {
            chrome.restyle();
        }
    }

    const puppetFile = path.join(process.cwd(), 'puppet', reload + '.js');
    if(!fs.existsSync(puppetFile)) {
        throw Error('Non existing reload mode or puppet script', reload);
    }
    puppetTest.runTests( [ puppetFile ] );
}
