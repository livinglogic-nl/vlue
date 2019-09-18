module.exports = class SourceBundler {
    constructor() {
        this.map = {};
        this.scripts = [];
        this.styles = [];
        this.index = null;
    }

    getMemory(name) {
        return this.map[name] || {};
    }
    setMemory(name, obj) {
        this.map[name] = obj;
    }

    addScript(entry) {
        this.scripts.push(entry);
    }

    addStyle(entry) {
        this.styles.push(entry);
    }

    updateIndex(entry) {
        this.indexUpdated = new Date();
        this.index = entry;
    }

    indexChanged(lastUpdate) {
        return this.indexUpdated > lastUpdate;
    }

    buildScript(sourceMap, rootRun) {
    }

    buildStyle() {
    }

}
