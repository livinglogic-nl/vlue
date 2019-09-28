const convertExports = require('./convert-exports');
const convertImports = require('./convert-imports');

module.exports = class Handler {
    detectChanges(entry, todo, sourceBundler, vendorBundler) {
        const obj = sourceBundler.getMemory(entry);
        const changed = obj !== entry.source;
        sourceBundler.setMemory(entry, entry.source);
        return changed;
    }

    process(entry, todo, sourceBundler, vendorBundler) {
        convertImports(entry, todo, vendorBundler);
        convertExports(entry);
        sourceBundler.addScript(entry);
    }
}
