const replaceEnvs = require('./replace-envs');
const path = require('path');
const fs = require('fs');

const Entry = require('./Entry');
const log = require('./log');
const convertExports = require('./convert-exports');
const vendorResolver = require('./vendor-resolver');

class VendorBundler {
    constructor() {
        this.vendors = new Set;
        this.dirty = true;
    }
    add(vendor) {
        const { vendors } = this;
        const lastSize = vendors.size;
        vendors.add(vendor);
        if(vendors.size > lastSize) {
            this.dirty = true;
        }
    }

    changed() {
        return this.dirty;
    }
    get fullScript() {
        if(this.dirty) {
            this._fullScript = this.buildScript();
            this.dirty = false;
        }
        return this._fullScript;
    }

    get supportScript() {
        let script = fs.readFileSync(path.join(__dirname, 'web', 'vuel-support.js')).toString();
        script = replaceEnvs(script);
        return script;
    }

    buildScript() {
        let script = '';
        this.vendors.forEach(name => {
            const dir = path.join('node_modules', name);
            if(!fs.existsSync(dir)) {
                throw Error(dir + ' required but does not exist');
            }
            const vendorLocalFile = vendorResolver(name);
            log.trace(name, 'resolved to', vendorLocalFile);
            const url = 'node_modules/'+name+'/'+vendorLocalFile;

            const entry = new Entry(url, null, name);
            entry.code = replaceEnvs(entry.code);
            convertExports(entry);
            script += entry.code;
        });
        return script;
    }
}

module.exports = () => new VendorBundler;
