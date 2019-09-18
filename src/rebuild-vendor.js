const vendorResolver = require('./vendor-resolver');
const log = require('./log');
const path = require('path');
const fs = require('fs');
const get = (file) => fs.readFileSync(file).toString();

const convertExports = require('./convert-exports');

const replaceEnvs = (str) => {
    return str.replace(/process\.env\.[A-z]+/g, (all, key) => process.env[key]);
}


module.exports = (vendors) => {

    let vendor = '';
    vendors.forEach(name => {
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
            code: get(url),
        };
        entry.code = replaceEnvs(entry.code);
        convertExports(entry);
        vendor += entry.code;
    });

    return vendor;
}
