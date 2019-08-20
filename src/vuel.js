
const fs = require('fs');
const child_process = require('child_process');
const chokidar = require('chokidar');
const debounce = require('debounce');

const server = require('./server');
const prepareIndex = require('./prepare-index');
const rebuildVendor = require('./rebuild-vendor');
const rebuildSource = require('./rebuild-source');
let sourceMap;
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

const rebuild = async(file, forced = false) => {
    const result = await rebuildSource(sourceExtensions);
    let { entries, vendors, styles } = result;

    let source = entries.map(e => e.str ).join('');
    if(source !== prevSource || forced) {
        console.log('script change');

        prevSource = source;

        source = `var vuelImports = {};
var vuelInstanced = {};
var vuelImport = (name) => {
    if(!vuelInstanced[name]) {
        vuelInstanced[name] = vuelImports[name]();
    }
    return vuelInstanced[name];
}
` + source;
        source += `vuelImport('src/index.js');`;

        delete require.cache[ require.resolve('./source-map') ];
        sourceMap = require('./source-map');
        const map = sourceMap.create(entries);
        source += sourceMap.sourceMappingURL(map);

        server.add('/index.js', source);
        if(!setsEqual(vendors, prevVendors)) {
            console.log('vendors change');
            const vendor = rebuildVendor(vendors);
            server.add('/vendor.js', vendor);
            prevVendors = vendors;
        }
        chrome.rescript(file);
    }

    const style = styles.join('\n');
    if(style != prevStyle) {
        prevStyle = style;
        if(style) {
            const result = sass.renderSync({
                data: style,
            });

            server.add('/style.css', result.css);
            chrome.restyle();
        }
    }

}

const index = prepareIndex();
server.add('/index.html', index);

const lazyRebuild = debounce(rebuild,40);
chokidar.watch('./src', {ignored: /(^|[\/\\])\../}).on('all', (event, path) => {
    if(event === 'change') {
        rebuild(event.path);
    } else if(event === 'add') {
        sourceExtensions[ path.substr(0, path.lastIndexOf('.')) ] = path;
        lazyRebuild();
    }
});
chokidar.watch('/Users/rinke/vuel/src', {ignored: /(^|[\/\\])\../}).on('all', (event, path) => {
    lazyRebuild(null, true);
});
server.start();
