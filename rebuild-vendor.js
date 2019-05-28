const fs = require('fs');
const get = (file) => fs.readFileSync(file).toString();
const set = (file,cnt) => fs.writeFileSync(file, cnt);

const toImports = require('./to-imports');

const replaceEnvs = (str) => {
    return str.replace(/process\.env\.[A-z]+/g, (all, key) => process.env[key]);
}

const vendorMap = {
    vue: 'dist/vue.common.dev.js',
    vuex: 'dist/vuex.common.js',
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
    vendors.forEach(mod => {
        console.log('adding',mod);
        let str = get('node_modules/'+mod+'/'+vendorMap[mod]);
        str = toImports(mod,str);
        str = replaceEnvs(str);
        vendor += str;
    });
    set('dist/vendor.js', vendor);
}
