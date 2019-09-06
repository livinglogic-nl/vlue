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

    let vendor = `var vuelImports = {};
var vuelInstanced = {};
var vuelImport = (name) => {
    if(!vuelInstanced[name]) {
        vuelInstanced[name] = vuelImports[name]();
    }
    return vuelInstanced[name];
}
`;
    vendors.forEach(name => {
        const dir = path.join('node_modules', name);
        if(!fs.existsSync(dir)) {
            throw Error(dir + ' required but does not exist');
        }


        const vendorLocalFile = vendorResolver(name);
        const url = 'node_modules/'+name+'/'+vendorLocalFile;
        const entry = {
            name,
            url,
            str: get(url),
        };
        entry.str = replaceEnvs(entry.str);
        convertExports(entry);
        vendor += entry.str;
    });
    return vendor;
}
