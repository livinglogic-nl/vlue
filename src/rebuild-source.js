
const fs = require('fs');
const get = (file) => fs.readFileSync(file).toString().trim();

const convertExports = require('./convert-exports');
const convertImports = require('./convert-imports');
const splitVue = require('./split-vue');

module.exports = async(sourceExtensions) => {
    const vendors = new Set();
    const locals = new Set();

    const root = 'src/index.js';
    const entries = [];
    const styles = [];

    const todo = [ root ];
    while(todo.length) {
        let path = todo.shift();
        const entry = {
            name: path,
            path,
            str: get(path),
        };
        entry.source = entry.str;
        if(path.includes('.vue')) {
            splitVue(entry, styles);
        }
        convertImports(sourceExtensions, entry, vendors, locals, todo);
        convertExports(entry);
        entries.push(entry);
    }
    return {
        entries,
        vendors,
        styles,
    };

}
