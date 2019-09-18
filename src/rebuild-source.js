const path = require('path');
const fs = require('fs');
const svgToDataurl = require('svg-to-dataurl');
const NotFoundError = require('./not-found-error');

const extensions = [ '', '.js', '.vue', '/index.js' ];
const getEntry = (url) => {
    let str = null;
    let name;
    extensions.some(ext => {
        try {
            str = fs.readFileSync(url+ext).toString().trim();
            name = url+ext;
            return true;
        } catch(e) {}
        return false;
    });
    if(str !== null) {
        return {
            url,
            str,
            name,
        };
    }
    throw new NotFoundError(url);
}

const convertExports = require('./convert-exports');
const convertImports = require('./convert-imports');
const splitVue = require('./split-vue');

module.exports = async(root, sourceBundler, vendorBundler) => {

    const vendors = new Set();
    const locals = new Set();

    const scripts = [];
    const styles = [];

    const todo = [ root ];
    while(todo.length) {
        const url = todo.shift();
        const entry = getEntry(url);
        entry.source = entry.str;

        const ext = path.extname(entry.name);
        switch(ext) {
            case '.vue':
                splitVue(entry, styles);
                break;

            case '.svg':
                const svg = entry.str;
                const dataUri = svgToDataurl(svg)
                    .replace(/\(/g,'%28')
                    .replace(/\)/g,'%29');
                entry.str = 'module.exports = "'+dataUri+'"';
                break;
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
