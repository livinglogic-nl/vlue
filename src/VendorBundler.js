const crypto = require('crypto');
const log = require('./log');
const vendorResolver = require('./vendor-resolver');
const path = require('path');
const fs = require('fs');
const convertExports = require('./convert-exports');

const replaceEnvs = (str) => {
    return str.replace(/process\.env\.[A-z]+/g, (all, key) => process.env[key]);
}

module.exports = class VendorBundler {
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

    get scriptHash() {
        return crypto.createHash('md5').update(this.fullScript).digest('hex');
    }

    buildScript() {
        let script = fs.readFileSync(path.join(__dirname, 'web', 'vuel-support.js'));
        this.vendors.forEach(name => {
            const dir = path.join('node_modules', name);
            if(!fs.existsSync(dir)) {
                throw Error(dir + ' required but does not exist');
            }
            const vendorLocalFile = vendorResolver(name);
            const url = 'node_modules/'+name+'/'+vendorLocalFile;
            log.trace(name, 'resolved to', vendorLocalFile, '('+ fs.statSync(url).size+')');
            const entry = {
                name,
                url,
                code: fs.readFileSync(url).toString(),
            };
            entry.code = replaceEnvs(entry.code);
            convertExports(entry);
            script += entry.code;
        });
        return script;
    }
}
