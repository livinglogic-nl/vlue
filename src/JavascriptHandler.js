const Handler = require('./Handler');
const convertExports = require('./convert-exports');
const convertImports = require('./convert-imports');

module.exports = class JavascriptHandler extends Handler {
    prepare(entry, sourceBundler, vendorBundler) {
        convertImports(entry, sourceBundler, vendorBundler);
        convertExports(entry);
        sourceBundler.addScript(entry);
    }
}
