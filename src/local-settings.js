const log = require('./log');
const fs = require('fs');

let config = {};
module.exports = {
    update() {
        try {
            config = JSON.parse( fs.readFileSync('.vuel-local.json') );
        } catch(e) {
            log.info('No .vuel-local.json found');
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
