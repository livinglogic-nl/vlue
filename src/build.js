const babel = require('./babel');
const path = require('path');
const log = require('./log');
const terser = require('terser');
const prepareIndex = require('./prepare-index');
const rebuild = require('./rebuild');
const rimraf = require('rimraf');
const fs = require('fs');

const VendorBundler = require('./VendorBundler');
const SourceBundler = require('./SourceBundler');

const sourceBundler = new SourceBundler();
const vendorBundler = new VendorBundler();

const emptyDirectory = (name) => {
    if(fs.existsSync(name)) {
        rimraf.sync(name);
    }
    fs.mkdirSync(name);
}


module.exports = async() => {
    emptyDirectory('dist');

    const result = await rebuild({
        roots:[],
        sourceBundler,
        vendorBundler,
    });

    let scripts;
    if(babel.isSupported()) {
        scripts = babel.babelify(sourceBundler, vendorBundler);
    } else {
        log.warn('No babel found, please:');
        log.warn('1. npm install @babel/core @babel/preset-env core-js');
        log.warn('2. make sure a babel.config.js is present in root of project');
        log.warn('An example babel.config.js is at: https://babeljs.io/docs/en/usage');

        scripts = {
            script: sourceBundler.fullScript,
            vendor: vendorBundler.fullScript,
        }
    }
    let { script, vendor } = scripts;

    vendor = vendorBundler.supportScript + vendor;

    // minify source
    script = terser.minify(script).code;
    vendor = terser.minify(vendor).code;

    const style = sourceBundler.fullStyle;
    // TODO: minify style

    const index = prepareIndex({ isDev: false, sourceBundler, vendorScript:vendor });

    const fsPromises = fs.promises;
    await Promise.all([
        fsPromises.writeFile('dist/index.html', index),
        fsPromises.writeFile('dist/index.js', script),
        fsPromises.writeFile('dist/vendor.js', vendor),
        fsPromises.writeFile('dist/style.css', style),
    ]);
    log.info('built');
}
