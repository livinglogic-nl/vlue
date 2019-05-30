
const fs = require('fs');
const child_process = require('child_process');
const chokidar = require('chokidar');
const debounce = require('debounce');

const server = require('./server');
const prepareIndex = require('./prepare-index');
const rebuildVendor = require('./rebuild-vendor');
const rebuildSource = require('./rebuild-source');
const generateSourcemap = require('./generate-sourcemap');
const chrome = require('./chrome');

const sourceExtensions = {};

let prevSource = null;
let prevVendors = new Set;
let prevStyle = null;

const eqSet = (a,b) => {
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
        source += generateSourcemap(entries);

        server.add('/index.js', source);
        if(!eqSet(vendors, prevVendors)) {
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
        server.add('/style.css', style);
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
