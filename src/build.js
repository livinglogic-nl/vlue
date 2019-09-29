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

    let script = sourceBundler.fullScript;
    const vendor = vendorBundler.fullScript;
    const style = sourceBundler.fullStyle;
    const index = prepareIndex({ isDev: false, sourceBundler, vendorBundler });

    // minify source
    script = terser.minify(script).code;

    // minify style

    const fsPromises = fs.promises;
    await Promise.all([
        fsPromises.writeFile('dist/index.html', index),
        fsPromises.writeFile('dist/index.js', script),
        fsPromises.writeFile('dist/vendor.js', vendor),
        fsPromises.writeFile('dist/style.css', style),
    ]);
    log.info('built');
}
