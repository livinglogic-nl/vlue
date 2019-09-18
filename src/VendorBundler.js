const log = require('./log');
const vendorResolver = require('./vendor-resolver');
const path = require('path');
const fs = require('fs');
const convertExports = require('./convert-exports');

const getHotReloadSource = () => {
    return fs.readFileSync( path.join(
        __dirname,
        '..',
        'node_modules',
        'vue-hot-reload-api',
        'dist',
        'index.js',
    )).toString();
}
const replaceEnvs = (str) => {
    return str.replace(/process\.env\.[A-z]+/g, (all, key) => process.env[key]);
}

module.exports = class VendorBundler {
    constructor() {
        this.lastSize = -1;
        this.vendors = new Set;
    }
    add(vendor) {
        this.vendors.add(vendor);
    }

    resolve() {
    }

    changed() {
        return (this.lastSize !== this.vendors.size);
    }

    buildScript(supportBundle) {
        this.lastSize = this.vendors.size;
        // let script = rebuildVendor(this.vendors);
        let script = '';
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
        const hotReload = {
            name: 'vue-hot-reload-api',
            code: getHotReloadSource(),
        };
        convertExports(hotReload);
        script += hotReload.code;
        return script;
    }
}
