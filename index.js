#!/usr/bin/env node
const terser = require('terser');
const prepareIndex = require('./src/prepare-index');
const fsPromises = require('fs').promises;
const puppetTest = require('./src/puppet-test');
const watch = require('./src/watch');
const log = require('./src/log');
const localSettings = require('./src/local-settings');
const chrome = require('./src/chrome');
const handleChanges = require('./src/handle-changes');
const rebuild = require('./src/rebuild');
const server = require('./src/server');
const path = require('path');
const fs = require('fs');
const debounce = require('debounce');


const SourceBundler = require('./src/SourceBundler');
const VendorBundler = require('./src/VendorBundler');

let isDev = !process.argv.includes('build');

let filesChanged = [];

const updateChrome = async(changes, filesChanged) => {
    const updatePromise = chrome.waitForUpdate();
    if(filesChanged.length === 0) {
        chrome.reload();
    } else {
        if(changes.source || changes.styles) {
            if(changes.source !== undefined) {
                log.trace('rescript');
                chrome.rescript(changes, filesChanged);
            }
            if(changes.styles) {
                log.trace('restyle');
                chrome.restyle(changes);
            }
        } else {
            return;
        }
    }
    await updatePromise;
}

const runPuppetTest = async(file) => {
    let puppetFile = null;
    if(file && file.indexOf('puppet') === 0) {
        puppetFile = path.join(process.cwd(), file);
    } else {
        const { puppet } = localSettings;
        if(puppet) {
            puppetFile = path.join(process.cwd(), 'puppet', puppet + '.spec.js');
            if(!fs.existsSync(puppetFile)) {
                throw Error('Puppet script ' + puppetFile + ' does not exist');
            }
        }
    }

    if(puppetFile) {
        await puppetTest.runTests( [ puppetFile ] );
    }
}

const sourceBundler = new SourceBundler();
const vendorBundler = new VendorBundler();


let lastChanges;
const renderIndex = () => {
    return prepareIndex({ isDev, changes:lastChanges });
}

const update = async(lastUpdate) => {
    const changed = filesChanged.concat();
    filesChanged = [];
    const file = changed.length === 1 ? changed[0] : null;

    const result = await rebuild({
        filesChanged: changed,
        sourceBundler,
        vendorBundler,
    });
    lastChanges = result;

    const { source, styles } = result;
    if(source) { server.add('/index.js', source); }

    let fullReload = false;
    if(changed.includes('src/index.html')) {
        console.log('index changed!');
        fullReload = true;
    }

    if(vendorBundler.changed()) {
        const bundle = vendorBundler.buildScript(true);
        server.add('/vendor.js', bundle);
        fullReload = true;
    }

    if(fullReload) {
        await chrome.reload();
    } else {
        await updateChrome(result, changed);
    }

    await runPuppetTest(file);
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
        log.trace('💾', file);
        if(file === '.vuel-local.json') {
            localSettings.update();
        }
        filesChanged.push(file);
        requestUpdate();
    });

    server.add('/vuel-support.js', fs.readFileSync( path.join(__dirname, 'src', 'web', 'vuel-support.js')) );
    server.addCallback('/index.html', renderIndex);
    server.start();
    requestUpdate();
}

const startBuild = async() => {
    const result = await rebuild({
        isDev: false,
        filesChanged:[],
    });
    let { index, source, vendor, styles } = result;
    let style = styles.map(s => s.code).join('');

    // minify source

    source = terser.minify(source).code;

    // minify style

    await Promise.all([
        fsPromises.writeFile('dist/index.html', index),
        fsPromises.writeFile('dist/index.js', source),
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

    if(process.argv.includes('build')) {
        startBuild();
    } else {
        startDev();
    }

};

start();


