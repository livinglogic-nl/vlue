
module.exports = class Handler {
    detectChanges(entry, sourceBundler, vendorBundler) {
        const obj = sourceBundler.getMemory(entry);
        const changed = obj !== entry.source;
        sourceBundler.setMemory(entry, entry.source);
        return changed;
    }

    process(entry, sourceBundler) {
    }
}
