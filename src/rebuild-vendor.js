const fs = require('fs');
const get = (file) => fs.readFileSync(file).toString();
const set = (file,cnt) => fs.writeFileSync(file, cnt);

const convertExports = require('./convert-exports');

const replaceEnvs = (str) => {
    return str.replace(/process\.env\.[A-z]+/g, (all, key) => process.env[key]);
}

const vendorMap = {
    vue: 'dist/vue.common.dev.js',
    vuex: 'dist/vuex.common.js',
    'vue-router': 'dist/vue-router.common.js',
};


module.exports = (vendors) => {

    let vendor = `
var vuelImports = {};
var vuelInstanced = {};
var vuelImport = (name) => {
    if(!vuelInstanced[name]) {
        vuelInstanced[name] = vuelImports[name]();
    }
    return vuelInstanced[name];
}
`;
    vendors.forEach(name => {
        const path = 'node_modules/'+name+'/'+vendorMap[name];
        const entry = {
            name,
            path,
            str: get(path),
        };
        entry.str = replaceEnvs(entry.str);
        convertExports(entry);
        vendor += entry.str;
    });
    return vendor;
    // set('dist/vendor.js', vendor);
}