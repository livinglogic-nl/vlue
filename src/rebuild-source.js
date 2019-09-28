const SassHandler = require('./SassHandler');
const log = require('./log');
const path = require('path');
const fs = require('fs');

const SvgHandler = require('./SvgHandler');
const VueHandler = require('./VueHandler');
const Handler = require('./Handler');
const Entry = require('./Entry');

const convertExports = require('./convert-exports');
const convertImports = require('./convert-imports');


const defaultHandler = new Handler();
const handlerMap = {
    vue: new VueHandler(),
    svg: new SvgHandler(),
    scss: new SassHandler(),
    js: defaultHandler,
}

module.exports = async(root, sourceBundler, vendorBundler) => {
    const todo = [ new Entry(root) ];
    while(todo.length) {
        const entry = todo.shift();
        let handler = handlerMap[entry.ext];
        if(!handler) {
            log.error('Cannot handle extension', entry.ext);
            continue;
        }

        if(!handler.detectChanges(entry, todo, sourceBundler)) {
            continue;
        }
        handler.process(entry, todo, sourceBundler, vendorBundler);

    }
    return {
        sourceBundler,
        vendorBundler,
    };

}
