const log = require('./log');
const path = require('path');
const fs = require('fs');

const SvgHandler = require('./SvgHandler');
const VueHandler = require('./VueHandler');
const JavascriptHandler = require('./JavascriptHandler');
const SassHandler = require('./SassHandler');

const Entry = require('./Entry');

const convertExports = require('./convert-exports');
const convertImports = require('./convert-imports');

const handlerMap = {
    vue: new VueHandler(),
    svg: new SvgHandler(),
    scss: new SassHandler(),
    js: new JavascriptHandler(),
}

module.exports = async(root, sourceBundler, vendorBundler) => {
    sourceBundler.addTodo(root);
    const toFinish = [];

    const { todo } = sourceBundler;
    while(todo.length) {
        const entry = todo.shift();
        let handler = handlerMap[entry.ext];
        if(!handler) {
            log.error('Cannot handle extension', entry.ext);
            continue;
        }
        if(!handler.detectChange(entry, sourceBundler, vendorBundler)) {
            continue;
        }

        handler.prepare(entry, sourceBundler, vendorBundler);
        toFinish.push({ entry, handler });
    }

    sourceBundler.scripts.filter(entry => entry.file).forEach(entry => {
        entry.code = '';
        if(entry.contexts.includes('script')) {
            const uri = entry.toDataURI(entry.source);
            entry.code = 'module.exports = "'+uri+'";';
            convertExports(entry);
        }
        if(entry.contexts.includes('nonscript')) {
            // TODO: as a seperate chunk when too large
            entry.uri = entry.toDataURI(entry.source);
        }
    });

    toFinish.forEach(obj => {
        const { entry, handler } = obj;
        handler.finish(entry, sourceBundler, vendorBundler);
    });
    return {
        sourceBundler,
        vendorBundler,
    };

}
