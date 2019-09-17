const convertExports = require('./convert-exports');
const path = require('path');
const fs = require('fs');
const log = require('./log');
const prepareIndex = require('./prepare-index');
const rebuildVendor = require('./rebuild-vendor');
const rebuildSource = require('./rebuild-source');
const server = require('./server');
const setsEqual = require('./sets-equal');
const sourceMap = require('./source-map');

let prevIndex = null;
let prevVendors = null;

const getHotReloadSource = () => {
    return fs.readFileSync( path.join(
        __dirname,
        '..',
        'node_modules',
        'vue-hot-reload-api',
        'dist',
        'index.js',
    )).toString();
}

module.exports = async({ isDev, filesChanged }) => {
    try {
        let root = 'src/index.js';
        if(filesChanged.length>0) {
            const sourceFilesChanged = filesChanged.filter(f => f.indexOf('src') === 0);
            if(sourceFilesChanged.length === 0) { return {}; }
            if(filesChanged.length === 1) {
                root = filesChanged[0];
            }
        }

        const changes = {};
        const result = await rebuildSource(root);
        let { scripts, styles, vendors } = result;

        let source = scripts.map(e => e.str ).join('');
        if(root === 'src/index.js') {
            source += `vuelImport('src/index.js');`;
        }

        const map = sourceMap.create(scripts);
        source += sourceMap.sourceMappingURL(map);
        changes.source = source;

        if(!prevVendors || !setsEqual(vendors, prevVendors)) {
            let vendor = rebuildVendor(vendors);
            const hotReload = {
                name: 'vue-hot-reload-api',
                str: getHotReloadSource(),
            };
            convertExports(hotReload);
            vendor += hotReload.str;

            prevVendors = vendors;
            changes.vendor = vendor;
        }


        changes.styles = styles;
 
        if(!prevIndex || filesChanged.includes('src/index.html')) {
            prevIndex = prepareIndex({ isDev, changes });
            changes.index = prevIndex;
        }
        return changes;
    } catch(e) {
        if(e.file && e.file === 'src/index.js') {
            log.error('vuel relies on src/index.js');
        } else if(e.file && e.file === 'src/index.html') {
            log.error('vuel relies on src/index.html');
        } else {
            throw e;
        }
    }
}
