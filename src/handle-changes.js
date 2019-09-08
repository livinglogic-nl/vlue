const eventBus = require('./event-bus');
const chrome = require('./chrome');
const fs = require('fs');
const path = require('path');
const localSettings = require('./local-settings');
const puppetTest = require('./puppet-test');

module.exports = async(changes) => {
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

}
