const fs = require('fs');
const path = require('path');

const prepareIndex = require('./../prepare-index');
const vuelSettings = require('./../vuel-settings');

const puppetTest = require('./../puppet-test');
const log = require('./../log');
const chrome = require('./../chrome');
const updateXHR = require('./../update-xhr');
const linter = require('./linter');
const server = require('./../server');
const rebuild = require('./../rebuild');
const time = require('./../time');
const VendorBundler = require('./../VendorBundler');
const SourceBundler = require('./../SourceBundler');

const sourceBundler = new SourceBundler(true);
const vendorBundler = new VendorBundler();

server.addCallback('/index.html', () => {
    return prepareIndex({ isDev:true, sourceBundler, vendorScript:vendorBundler.fullScript });
});
server.addCallback('/index.js', () => {
    return sourceBundler.fullScript;
});
server.start(vuelSettings.port);


const removeChanged = (roots, name, callback) => {
    for(let i=0; i<roots.length; i++) {
        if(roots[i].indexOf(name) === 0) {
            roots.splice(i,1);
            callback();
        }
    }
};

module.exports = async({
    lastUpdate,
    filesChanged,
}) => {
    time.start('update');

    let fullReload = lastUpdate === null;
    let lintAll = lastUpdate === null;

    const roots = filesChanged;
    removeChanged(roots, 'eslint.config.js', () => { lintAll = true; });
    removeChanged(roots, 'src/index.html', () => { fullReload = true });
    removeChanged(roots, 'vuel.js', () => { vuelSettings.update(); });
    removeChanged(roots, 'vuel.local.js', () => { localSettings.update(); });
    removeChanged(roots, 'mock/xhr', () => { updateXHR(); });

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

    linter.lint({
        filesChanged,
        sourceBundler,
        lintAll,
        fix: true,
        fix: false,
    });


    if(!lastUpdate) {
        await updateXHR();
    }
    if(fullReload) {
        await chrome.reload();
    } else {
        if(sourceBundler.scripts.length || sourceBundler.styles.length) {
            await chrome.hot(sourceBundler);
        } else {
            //await chrome.reload();
        }
    }
    const updatedms = time.end('update');
    log.info('updated in '+updatedms+'ms');

    await puppetTest.runDev(roots);
    log.info('idle');
}
