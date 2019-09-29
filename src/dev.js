const prepareIndex = require('./prepare-index');
const log = require('./log');
const chrome = require('./chrome');
const updateXHR = require('./update-xhr');
const path = require('path');
const rebuild = require('./rebuild');
const puppetTest = require('./puppet-test');
const vuelSettings = require('./vuel-settings');
const server = require('./server');
const watch = require('./watch');
const fs = require('fs');
const VendorBundler = require('./VendorBundler');
const SourceBundler = require('./SourceBundler');

const sourceBundler = new SourceBundler();
const vendorBundler = new VendorBundler();

let filesChanged = new Set;
const update = async(lastUpdate) => {
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
    await puppetTest.runDev(roots);
    log.info('idle');
}

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
            update(lastUpdate);
            lastUpdate = new Date;
        }
    },100);

    const requestUpdate = () => { lastUpdateRequest = new Date; }

    const dirs = fs.readdirSync('.');
    watch('.', (e,file) => {
        if(file.indexOf('.') === 0) { return; }
        if(file.includes('/.')) { return; }
        fs.lstat(file, (e, stats)=> {
            if(!e && stats.isDirectory()) {
                return;
            }
            log.trace(file, 'changed');
            filesChanged.add(file);
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

    await puppetTest.initDev();
    requestUpdate();
}
