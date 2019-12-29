const convertExports = require('./convert-exports');
const Handler = require('./Handler');
const svgToDataurl = require('svg-to-dataurl');

module.exports = class SvgHandler extends Handler {
    prepare(entry, sourceBundler, vendorBundler) {
        entry.file = true;
        entry.toDataURI = (entry) => svgToDataurl(entry.source)
            .replace(/\(/g,'%28')
            .replace(/\)/g,'%29');
        sourceBundler.addScript(entry);
    }
};
