const convertExports = require('./convert-exports');
const convertImports = require('./convert-imports');

module.exports = class Handler {
    detectChange(entry, sourceBundler, vendorBundler) {
        const obj = sourceBundler.getMemory(entry);
        const changed = obj !== entry.source;
        sourceBundler.setMemory(entry, entry.source);
        return changed;
    }

    prepare(entry, sourceBundler, vendorBundler) {
        convertImports(entry, sourceBundler, vendorBundler);
        convertExports(entry);
        sourceBundler.addScript(entry);
    }

    finish(entry, sourceBundler, vendorBundler) {
    }
}
