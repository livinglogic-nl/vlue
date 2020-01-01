const log = require('./log');
const rebuildSource = require('./rebuild-source');

module.exports = async({ filesChanged, sourceBundler, vendorBundler }) => {
    try {
        sourceBundler.newSession(filesChanged);
        if(filesChanged.length === 0) {
            filesChanged = [ 'src/index.js' ];
        }
        for await(let file of filesChanged) {
            if(file.indexOf('src') !== 0) { continue; }
            await rebuildSource(file, sourceBundler, vendorBundler);
        }
    } catch(e) {
        if(e.file && e.file === 'src/index.js') {
            log.error('vlue relies on src/index.js');
        } else {
            throw e;
        }
    }
}
