const path = require('path');
const log = require('./log');
const fs = require('fs');

let config = {};
const result = {
    update() {
        try {
            const url = path.join(process.cwd(), 'vuel.local.js');
            delete require.cache[ require.resolve(url) ];
            config = require(url);
        } catch(e) {
            log.tip('Adding a vuel.local.js allows for local setup');
            config = {};
        }
    },

    get puppetInterval() {
        return config.puppetInterval || 0;
    },

    get puppet() {
        return config.puppet;
    },
    get headless() {
        return config.headless;
    },
};

result.update();

module.exports = result;
