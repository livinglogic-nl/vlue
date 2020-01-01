const path = require('path');
const log = require('./log');
const fs = require('fs');

let config = {};
const result = {
    update() {
        try {
            const url = path.join(process.cwd(), 'vlue.js');
            delete require.cache[ require.resolve(url) ];
            config = require(url);
        } catch(e) {
            log.tip('Adding a vlue.js allows for general setup');
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

result.update();

module.exports = result;
