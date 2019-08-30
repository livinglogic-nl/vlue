const fs = require('fs');

let config = {};
module.exports = {
    update() {
        const cnt = fs.readFileSync('.vuel-local.js');
        config = eval(cnt);
    },

    get puppet() {
        return config.puppet;
    },
    get headless() {
        return config.headless;
    },
};
