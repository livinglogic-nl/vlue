const log = require('./log');
const puppetTest = require('./puppet-test');
const chrome = require('./chrome');
const prepareIndex = require('./prepare-index');
const updateXHR = require('./update-xhr');
const server = require('./server');
const fs = require('fs');
const path = require('path');
const rebuild = require('./rebuild');
const time = require('./time');


module.exports = async({
    lastUpdate,
    filesChanged,
    sourceBundler,
    vendorBundler,
}) => {
    time.start('update');
    let fullReload = lastUpdate === null;
    const roots = [...filesChanged];
    filesChanged.clear();
    const handleFile = (name, callback) => {
        for(let i=0; i<roots.length; i++) {
            if(roots[i].indexOf(name) === 0) {
                roots.splice(i,1);
                callback();
            }
        }
    };

    handleFile('src/index.html', () => { fullReload = true });
    handleFile('vuel.js', () => { vuelSettings.update(); });
    handleFile('vuel.local.js', () => { localSettings.update(); });
    handleFile('mock/xhr', () => { updateXHR(); });

    if(!lastUpdate || roots.length > 0) {
        await rebuild({
            roots,
            sourceBundler,
            vendorBundler,
        });
        if(vendorBundler.changed()) {
            const lib = 'vue-hot-reload-api';
            const libPath = path.join('node_modules', lib);
            if(fs.existsSync(libPath)) {
                vendorBundler.add(lib);
            } else {
                log.warn('npm install '+lib + ' to enable hot reloading');
                return;
            }
            server.add('/vendor.js', [
                vendorBundler.supportScript,
                vendorBundler.fullScript
            ].join('\n'));
            fullReload = true;
        }
    }
    // sourceBundler.fullScript;
    // return;

    if(!lastUpdate) {
        await updateXHR();
    }
    if(fullReload) {
        await chrome.reload();
    } else {
        if(sourceBundler.scripts.length || sourceBundler.styles.length) {
            await chrome.hot(sourceBundler);
        } else {
            await chrome.reload();
        }
    }
    const updatedms = time.end('update');

    await puppetTest.runDev(roots);
    log.info('idle. updated in '+updatedms+'ms');
}
