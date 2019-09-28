const path = require('path');
const log = require('./log');
const fs = require('fs');

let config = {};
module.exports = {
    update() {
        try {
            const url = path.join(process.cwd(), 'vuel.js');
            delete require.cache[ require.resolve(url) ];
            config = require(url);
        } catch(e) {
            log.info('No vuel.js found');
            config = {};
        }
    },

    get resolve() {
        return config.resolve || {};
    },

    get domain() {
        return config.domain || 'http://localhost:' + this.port;
    },

    get port() {
        return config.port || 8080;
    },

    get mockXHR() {
        return config.mock.xhr | null;
    },
};
