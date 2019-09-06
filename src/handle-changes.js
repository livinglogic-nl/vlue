const eventBus = require('./event-bus');
const chrome = require('./chrome');
const fs = require('fs');
const path = require('path');
const localSettings = require('./local-settings');
const puppetTest = require('./puppet-test');

module.exports = async(changes) => {
    const { puppet } = localSettings;

    const updatePromise = chrome.waitForUpdate();
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

    if(puppet) {
        await updatePromise;
        console.log({
            changes:'puppet',
        });

        const puppetFile = path.join(process.cwd(), 'puppet', puppet + '.spec.js');
        if(!fs.existsSync(puppetFile)) {
            throw Error('Puppet script ' + puppetFile + ' does not exist');
        }
        await puppetTest.runTests( [ puppetFile ] );
    }
}
