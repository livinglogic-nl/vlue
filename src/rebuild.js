const path = require('path');
const fs = require('fs');


const log = require('./log');
const prepareIndex = require('./prepare-index');
const rebuildSource = require('./rebuild-source');
const server = require('./server');
const sourceMap = require('./source-map');

let prevIndex = null;

module.exports = async({ filesChanged, sourceBundler, vendorBundler }) => {
    try {
        const changes = {
            sourceBundler,
            vendorBundler,
        };

        if(filesChanged.length === 0) {
            filesChanged = [ 'src/index.js' ];
        }

        for(let i=0; i<filesChanged.length; i++) {
            let root = filesChanged[i];
            if(root.indexOf('src') !== 0) { continue; }

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
