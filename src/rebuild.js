const log = require('./log');
const rebuildSource = require('./rebuild-source');

module.exports = async({ roots, sourceBundler, vendorBundler }) => {
    try {
        sourceBundler.newSession(roots);

        if(roots.length === 0) {
            roots = [ 'src/index.js' ];
        }
        for(let i=0; i<roots.length; i++) {
            const root = roots[i];
            if(root.indexOf('src') !== 0) { continue; }
            await rebuildSource(root, sourceBundler, vendorBundler);
        }
    } catch(e) {
        if(e.file && e.file === 'src/index.js') {
            log.error('vuel relies on src/index.js');
        } else {
            throw e;
        }
    }
}
