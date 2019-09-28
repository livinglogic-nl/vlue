#!/usr/bin/env node
const terser = require('terser');
const prepareIndex = require('./src/prepare-index');
const fsPromises = require('fs').promises;
const puppetTest = require('./src/puppet-test');
const watch = require('./src/watch');
const log = require('./src/log');
const localSettings = require('./src/local-settings');
const vuelSettings = require('./src/vuel-settings');
const chrome = require('./src/chrome');
const handleChanges = require('./src/handle-changes');
const rebuild = require('./src/rebuild');
const server = require('./src/server');
const path = require('path');
const fs = require('fs');
const convertExports = require('./src/convert-exports');
const updateXHR = require('./src/update-xhr');


const SourceBundler = require('./src/SourceBundler');
const VendorBundler = require('./src/VendorBundler');

const getHotReloadSource = () => {
    return fs.readFileSync( path.join(
        __dirname,
        'node_modules',
        'vue-hot-reload-api',
        'dist',
        'index.js',
    )).toString();
}

const projectModules = path.join(process.cwd(), 'node_modules');

const isDev = !process.argv.includes('build');
process.env.NODE_ENV = isDev ? 'development' : 'production';

let filesChanged = [];

const runPuppetTest = async(roots) => {
    let puppetFile = roots.find(f => f.indexOf('puppet') === 0);
    if(!puppetFile) {
        const { puppet } = localSettings;
        if(puppet) {
            puppetFile = path.join('puppet', puppet + '.spec.js');
            if(!fs.existsSync(puppetFile)) {
                throw Error('Puppet script ' + puppetFile + ' does not exist');
            }
        }
    }

    if(puppetFile) {
        await puppetTest.runTests( [ path.join(process.cwd(), puppetFile) ] );
    }
}

const sourceBundler = new SourceBundler();
const vendorBundler = new VendorBundler();

const update = async(lastUpdate) => {
    let fullReload = lastUpdate === null;

    const roots = filesChanged.concat();
    filesChanged = [];

    const handleFile = (name, callback) => {
        for(let i=0; i<roots.length; i++) {
            if(roots[i].indexOf(name) === 0) {
                roots.splice(i,1);
                callback();
            }
        }
    };

    handleFile('src/index.html', () => { fullReload = true });
    handleFile('vuel.js', () => { localSettings.update(); });
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
            const libPath = path.join(projectModules, lib);
            if(fs.existsSync(libPath)) {
                vendorBundler.add(lib);
            } else {
                log.warn('npm install '+lib + ' to enable hot reloading');
            }
            server.add('/vendor.js', vendorBundler.fullScript);
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
    await runPuppetTest(roots);
    log.info('idle');
}

const startDev = () => {
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

    const requestUpdate = () => {
        lastUpdateRequest = new Date;
    }

    const dirs = fs.readdirSync('.');
    watch('.', (e,file) => {
        if(file.indexOf('.git') === 0) { return; }
        log.trace('💾', file);
        filesChanged.push(file);
        requestUpdate();
    });

    server.addCallback('/index.html', () => {
        return prepareIndex({ isDev, sourceBundler, vendorBundler });
    });
    server.addCallback('/index.js', () => {
        return sourceBundler.fullScript;
    });
    server.start(vuelSettings.port);
    requestUpdate();
}

const startBuild = async() => {
    const result = await rebuild({
        roots:[],
        sourceBundler,
        vendorBundler,
    });

    let script = sourceBundler.fullScript;
    const vendor = vendorBundler.fullScript;
    const style = sourceBundler.fullStyle;
    const index = prepareIndex({ isDev, sourceBundler, vendorBundler });

    // minify source
    script = terser.minify(script).code;

    // minify style

    await Promise.all([
        fsPromises.writeFile('dist/index.html', index),
        fsPromises.writeFile('dist/index.js', script),
        fsPromises.writeFile('dist/vendor.js', vendor),
        fsPromises.writeFile('dist/style.css', style),
    ]);
    log.info('built');
}

const start = async() => {
    process.on('uncaughtException', (reason) => {
        log.error(reason.stack || reason);
    });
    process.on('unhandledRejection', (reason) => {
        log.error(reason.stack || reason);
    });
    localSettings.update();
    vuelSettings.update();

    if(process.argv.includes('build')) {
        startBuild();
    } else {
        startDev();
    }

};

start();


