const log = require('./log');
const prepareIndex = require('./prepare-index');
const devUpdate = require('./dev-update');
const vuelSettings = require('./vuel-settings');
const server = require('./server');
const watch = require('./watch');
const fs = require('fs');

const VendorBundler = require('./VendorBundler');
const SourceBundler = require('./SourceBundler');

const sourceBundler = new SourceBundler(true);
const vendorBundler = new VendorBundler();

let filesChanged = new Set;

module.exports = async() => {
    const elapsed = (date,ms) => {
        if(!date) return true;
        return (new Date() - date) > ms;
    }

    let lastUpdate = null;
    let lastUpdateRequest = null;

    setInterval(() => {
        if(!lastUpdateRequest) {
            return;
        }
        if(elapsed(lastUpdateRequest,200)) {
            lastUpdateRequest = null;
            devUpdate({
                lastUpdate,
                filesChanged,
                sourceBundler,
                vendorBundler,
            });
            lastUpdate = new Date;
        }
    },20);

    const requestUpdate = () => { lastUpdateRequest = new Date; }
    watch('.', (e,file) => {
        if(file.indexOf('.') === 0) { return; }
        if(file.includes('/.')) { return; }
        fs.lstat(file, (e, stats)=> {
            if(!e && stats.isDirectory()) {
                return;
            }
            if(e && e.code === 'ENOENT') {
                log.trace(file, 'removed');
            } else {
                filesChanged.add(file);
                log.trace(file, 'changed');
            }
            requestUpdate();
        });
    });

    server.addCallback('/index.html', () => {
        return prepareIndex({ isDev:true, sourceBundler, vendorScript:vendorBundler.fullScript });
    });
    server.addCallback('/index.js', () => {
        return sourceBundler.fullScript;
    });
    server.start(vuelSettings.port);

    requestUpdate();
}
