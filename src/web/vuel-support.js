var vuelImports = {};
var vuelInstanced = {};
var vuelImport = (name) => {
    if(!vuelInstanced[name]) {
        vuelInstanced[name] = vuelImports[name]();

        if(process.env.NODE_ENV === 'development' && name.includes('.vue')) {
            const lib = 'vue-hot-reload-api';
            const fresh = vuelInstanced[lib] === undefined;
            const api = vuelImport(lib);
            if(fresh) {
                const Vue = vuelImport('vue');
                api.install(Vue);
                if(!api.compatible) {
                    console.error(name, ' not compatible with vue '+Vue.version);
                }
            }
            if(!api.isRecorded(name)) {
                api.createRecord(name, vuelInstanced[name]);
            }
        }
    }
    return vuelInstanced[name];
}
