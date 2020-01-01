var vlueImports = {};
var vlueInstanced = {};
var vlueImport = (name) => {
    if(!vlueInstanced[name]) {
        vlueInstanced[name] = vlueImports[name]();

        if(process.env.NODE_ENV === 'development' && name.includes('.vue')) {
            const lib = 'vue-hot-reload-api';
            const fresh = vlueInstanced[lib] === undefined;
            const api = vlueImport(lib);
            if(fresh) {
                const Vue = vlueImport('vue');
                api.install(Vue);
                if(!api.compatible) {
                    console.error(name, ' not compatible with vue '+Vue.version);
                }
            }
            if(!api.isRecorded(name)) {
                api.createRecord(name, vlueInstanced[name]);
            }
        }
    }
    return vlueInstanced[name];
}
