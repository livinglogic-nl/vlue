const path = require('path');
const fs = require('fs');

const VendorBundler = require('./VendorBundler');
const SourceBundler = require('./SourceBundler');

const log = require('./log');
const prepareIndex = require('./prepare-index');
const rebuildSource = require('./rebuild-source');
const server = require('./server');
const sourceMap = require('./source-map');

let prevIndex = null;
const sourceBundler = new SourceBundler();
const vendorBundler = new VendorBundler();

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

        const changes = {
            sourceBundler,
            vendorBundler,
        };

        const result = await rebuildSource(root, sourceBundler, vendorBundler);
        let { scripts, styles } = result;
        let source = scripts.map(e => e.code).join('');
        if(root === 'src/index.js') {
            source += `vuelImport('src/index.js');`;
        }

        const map = sourceMap.create(scripts);
        source += sourceMap.sourceMappingURL(map);
        changes.source = source;
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
