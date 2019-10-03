const Entry = require('./Entry');
const path = require('path');
const resolve = require('./resolve');
// const sourceMap = require('./source-map');

let sourceMap;

module.exports = class SourceBundler {
    constructor(isDev) {
        this.isDev = isDev;
        this.memoryMap = {};
        this.scriptMap = {};
        this.styleMap = {};
    }

    newSession(filesChanged) {
        delete require.cache[ require.resolve('./source-map') ];
        sourceMap = require('./source-map');

        this.filesChanged = filesChanged;
        this.todo = [];
        this.scripts = [];
        this.styles = [];
        this.requestedUrls = [];
    }

    addTodo(url, content = null, context = 'script') {
        if(this.scriptMap[url] && !this.filesChanged.includes(url)) {
            return;
        }
        let entry = this.todo.find(e => e.url === url);
        if(!entry) {
            entry = new Entry(url, content);
            this.todo.push(entry);
        }
        entry.contexts.push(context);
    }

    getMemory(entry) {
        return this.memoryMap[entry.url] || {};
    }
    setMemory(entry, obj) {
        this.memoryMap[entry.url] = obj;
    }

    addScript(entry) {
        this.fullScriptDirty = true;
        this.scriptMap[entry.url] = entry;
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
        if(runIndex) {
            source += `vuelImport('src/index.js');`;
        }
        if(this.isDev) {
            const map = sourceMap.create(scripts);
            source += sourceMap.sourceMappingURL(map);
        }
        return source;
    }

    addStyle(entry) {
        this.fullStyleDirty = true;
        this.styleMap[entry.url] = entry;
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


    requestUrl(entry, url) {
        const resolved = resolve(path.dirname(entry.url), url);
        this.addTodo(resolved, null, 'nonscript');
        return 'vuel-url:' + resolved;
    }

    resolveUrls(entry) {
        entry.code = entry.code.replace(/vuel-url:([^\)'"]+)/g, (all, url) => {
            return this.scriptMap[url].uri;
        });
    }
}
