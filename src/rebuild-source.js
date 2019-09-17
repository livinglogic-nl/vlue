const fs = require('fs');
const svgToDataurl = require('svg-to-dataurl');
const NotFoundError = require('./not-found-error');

const extensions = [ '', '.js', '.vue', '/index.js' ];
const get = (file) => {
    let cnt = null;
    let resolved;
    extensions.some(ext => {
        try {
            cnt = fs.readFileSync(file+ext).toString().trim();
            resolved = file+ext;
            return true;
        } catch(e) {}
        return false;
    });
    if(cnt !== null) {
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

module.exports = async(root) => {

    const vendors = new Set();
    const locals = new Set();

    const scripts = [];
    const styles = [];

    const todo = [ root ];
    while(todo.length) {
        const path = todo.shift();
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
            const dataUri = svgToDataurl(svg)
                .replace(/\(/g,'%28')
                .replace(/\)/g,'%29');
            entry.str = 'module.exports = "'+dataUri+'"';
        }

        convertImports(entry, vendors, locals, todo);
        convertExports(entry);
        scripts.push(entry);
    }
    return {
        scripts,
        vendors,
        styles,
    };

}
