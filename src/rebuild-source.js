const NotFoundError = require('./not-found-error');
const fs = require('fs');


const extensions = [ '', '.js', '.vue', '/index.js' ];
const get = (file) => {
    let cnt;
    let resolved;
    extensions.some(ext => {
        try {
            cnt = fs.readFileSync(file+ext).toString().trim();
            resolved = file+ext;
            return true;
        } catch(e) {}
        return false;
    });
    if(typeof(cnt) === 'string') {
        return {
            cnt,
            resolved,
        };
    }
    throw new NotFoundError(file);
}

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
        let contents = get(path);
        const entry = {
            path,
            name: contents.resolved,
            str: contents.cnt,
        };
        entry.source = entry.str;
        if(path.includes('.vue') || !path.includes('.')) {
            splitVue(entry, styles);
        } else if(path.includes('.svg')) {
            const svg = entry.str;
            entry.str = `module.exports = '${svg}';`;
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
