
const fs = require('fs');
const child_process = require('child_process');
const chokidar = require('chokidar');
const debounce = require('debounce');

const server = require('./server');
const prepareIndex = require('./prepare-index');
const rebuildVendor = require('./rebuild-vendor');
const rebuildSource = require('./rebuild-source');
const sourceMap = require('./source-map');
const chrome = require('./chrome');

const sass = require('node-sass');
const sourceExtensions = {};
const lines = require('./get-line-count');

let prevSource = null;
let prevVendors = new Set;
let prevStyle = null;

const setsEqual = (a,b) => {
    if(a.size !== b.size) { return false; }
    for(let key of a) {
        if(!b.has(key)) { return false; }
    }
    return true;
}

const rebuild = async() => {
    const result = await rebuildSource(sourceExtensions);
    let { entries, vendors, styles } = result;

    let source = entries.map(e => e.str ).join('');
    if(source !== prevSource) {
        console.log('script change');

        prevSource = source;
        source += `vuelImport('src/index.js');`;

        const map = sourceMap.create(entries);
        source += sourceMap.sourceMappingURL(map);

        server.add('/index.js', source);
        if(!setsEqual(vendors, prevVendors)) {
            console.log('vendors change');
            const vendor = rebuildVendor(vendors);
            server.add('/vendor.js', vendor);
            prevVendors = vendors;
        }
        chrome.rescript();
    }

    const style = styles.join('\n');
    if(style != prevStyle) {
        console.log('style change');
        const result = sass.renderSync({
            data: style,
        });

        server.add('/style.css', result.css);
        prevStyle = style;
        chrome.restyle();
    }

}

const index = prepareIndex();
server.add('/', index);

const lazyRebuild = debounce(rebuild,40);
chokidar.watch('./src', {ignored: /(^|[\/\\])\../}).on('all', (event, path) => {
    if(event === 'change') {
        console.log(event, path);
        rebuild();
    } else if(event === 'add') {
        sourceExtensions[ path.substr(0, path.lastIndexOf('.')) ] = path;
        lazyRebuild();
    }
});
server.start();
