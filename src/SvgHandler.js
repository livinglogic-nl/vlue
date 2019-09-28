const convertExports = require('./convert-exports');
const Handler = require('./Handler');
const svgToDataurl = require('svg-to-dataurl');

module.exports = class SvgHandler extends Handler {
    process(entry, todo, sourceBundler, vendorBundler) {
        const svg = entry.code;
        const dataUri = svgToDataurl(svg)
            .replace(/\(/g,'%28')
                .replace(/\)/g,'%29');
        entry.code = 'module.exports = "'+dataUri+'";';
        convertExports(entry);
        sourceBundler.addScript(entry);
    }
};
