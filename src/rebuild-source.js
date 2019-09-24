const log = require('./log');
const path = require('path');
const fs = require('fs');

const SvgHandler = require('./SvgHandler');
const VueHandler = require('./VueHandler');
const Handler = require('./Handler');
const resolveEntry = require('./resolve-entry');

const convertExports = require('./convert-exports');
const convertImports = require('./convert-imports');
const splitVue = require('./split-vue');


const defaultHandler = new Handler();
const handlerMap = {
    vue: new VueHandler(),
    svg: new SvgHandler(),
    js: defaultHandler,
}
            // handler = defaultHandler;

module.exports = async(root, sourceBundler, vendorBundler) => {
    const vendors = new Set();
    const scripts = [];
    const styles = [];

    const todo = [ root ];
    while(todo.length) {
        const url = todo.shift();
        let entry = resolveEntry(url);
        let handler = handlerMap[entry.ext];
        if(!handler) {
            log.trace('Cannot handle extension', entry.ext);
            continue;
        }

        if(!handler.detectChanges(entry, sourceBundler)) {
            continue;
        }
        handler.process(entry, sourceBundler);

        convertImports(entry, vendors, todo, vendorBundler);
        convertExports(entry);
        scripts.push(entry);

        sourceBundler.addScript(entry);
    }
    return {
        scripts,
        vendors,
        styles,
        sourceBundler,
        vendorBundler,
    };

}
