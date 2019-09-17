var api = null;
var vuelImports = {};
var vuelInstanced = {};
var vuelImport = (name) => {
    if(!vuelInstanced[name]) {
        vuelInstanced[name] = vuelImports[name]();

        if(name.includes('.vue')) {
            if(!api) {
                api = vuelImport('vue-hot-reload-api');
                const Vue = vuelImport('vue');
                api.install(Vue);
                if(!api.compatible) {
                    console.error('vue-hot-reload-api not compatible with vue '+Vue.version);
                }
            }
            if(!api.isRecorded(name)) {
                api.createRecord(name, vuelInstanced[name]);
            }
        }
    }
    return vuelInstanced[name];
}
