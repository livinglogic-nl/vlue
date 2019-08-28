const path = require('path');
const fs = require('fs');
const get = (file) => fs.readFileSync(file).toString();
const set = (file,cnt) => fs.writeFileSync(file, cnt);

const convertExports = require('./convert-exports');

const replaceEnvs = (str) => {
    return str.replace(/process\.env\.[A-z]+/g, (all, key) => process.env[key]);
}

const vendorMap = {
    vue: 'dist/vue.common.dev.js',
    // vue: 'dist/vue.common.prod.js',
    vuex: 'dist/vuex.common.js',
    'vue-router': 'dist/vue-router.common.js',
};


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
        const url = 'node_modules/'+name+'/'+vendorMap[name];
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
