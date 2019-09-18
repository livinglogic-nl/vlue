module.exports = class SourceBundler {
    constructor() {
        this.map = {};
    }
    getMemory(name) {
        return this.map[name] || {};
    }
    setMemory(name, obj) {
        this.map[name] = obj;
    }

    addScript(name, str, reloadMethod) {
    }

    addStyle(name, str) {
    }

    addHtml(name, str) {
    }

    buildScript(sourceMap, rootRun) {
    }

    buildStyle() {
    }

}
