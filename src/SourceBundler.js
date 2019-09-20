const crypto = require('crypto');
const sourceMap = require('./source-map');

module.exports = class SourceBundler {
    constructor() {
        this.memoryMap = {};
        this.scriptMap = {};
        this.styleMap = {};
    }

    newSession() {
        this.scripts = [];
        this.styles = [];
    }

    getMemory(entry) {
        return this.memoryMap[entry.name] || {};
    }
    setMemory(entry, obj) {
        this.memoryMap[entry.name] = obj;
    }

    addScript(entry) {
        this.fullScriptDirty = true;
        this.scriptMap[entry.name] = entry;
        this.scripts.push(entry);
    }

    get fullScript() {
        if(this.fullScriptDirty) {
            const scripts = Object.values(this.scriptMap);
            this._fullScript = this.buildScript(scripts, true);
            this.fullScriptDirty = false;
        }
        return this._fullScript;
    }

    get partialScript() {
        return this.buildScript(this.scripts, false);
    }

    buildScript(scripts, runIndex = false) {
        let source = scripts.map(e => e.code).join('');
        source += `vuelImport('src/index.js');`;
        const map = sourceMap.create(scripts);
        source += sourceMap.sourceMappingURL(map);
        return source;
    }

    addStyle(entry) {
        this.styleMap[entry.name] = entry;
        this.styles.push(entry);
    }


    get fullStyle() {
        if(this.fullStyleDirty) {
            const styles = Object.values(this.styleMap);
            this._fullStyle = styles.map(e => e.code).join('');
            this.fullStyleDirty = false;
        }
        return this._fullStyle;
    }

    get scriptHash() {
        return crypto.createHash('md5').update(this.fullScript).digest('hex');
    }
    get styleHash() {
        return crypto.createHash('md5').update(this.fullStyle).digest('hex');
    }

}
