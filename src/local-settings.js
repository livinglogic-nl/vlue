const path = require('path');
const log = require('./log');
const fs = require('fs');

let config = {};
module.exports = {
    update() {
        try {
            const url = path.join(process.cwd(), 'vuel.local.js');
            console.log(url);
            delete require.cache[ require.resolve(url) ];
            config = require(url);
        } catch(e) {
            log.info('No vuel.local.js found');
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
