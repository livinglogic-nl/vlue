const Handler = require('./Handler');
const splitVue = require('./split-vue');

module.exports = class VueHandler extends Handler {
    process(entry, styles) {
        splitVue(entry, styles);
    }
};
