
const fs = require('fs');
const child_process = require('child_process');
const chokidar = require('chokidar');

// One-liner for current directory, ignores .dotfiles
chokidar.watch('./src', {ignored: /(^|[\/\\])\../}).on('all', (event, path) => {
    console.log(event, path);
    if(event === 'change') {
        rebuild();
    }

});

const get = (file) => fs.readFileSync(file).toString();
const set = (file,cnt) => fs.writeFileSync(file, cnt);

const vendorMap = {
    vue: 'dist/vue.common.dev.js',
    vuex: 'dist/vuex.common.js',
};

const toImports = (name, str) => {
    str = str.replace('export default', 'module.exports = ');
    return `vuelImports['${name}'] = (function() {
        var module = {};
        ${str}
        return module.exports;
        })();
        `;
};

const rebuildVendor = () => {
    const replaceEnvs = (str) => {
        return str.replace(/process\.env\.[A-z]+/g, (all, key) => process.env[key]);
    }

    let vendor = `
var vuelImports = {};
var vuelImport = (name) => {
    return vuelImports[name];
}
`;
    [
        'vue',
        'vuex',
    ].forEach(mod => {
        let str = get('node_modules/'+mod+'/'+vendorMap[mod]);
        str = toImports(mod,str);
        str = replaceEnvs(str);
        vendor += str;
    });
    set('dist/vendor.js', vendor);
}

const rebuild = () => {
    console.time('rebuild');
    fs.copyFile(
        'src/index.html',
        'dist/index.html',
        e => {
        }
    );

    let index = get('src/index.js');
    //replace node_modules with vuelImports
    index = index.replace(/import ([A-z]+?) from '(.+)';/g, (all, as, from) => {
        return `var ${as} = vuelImport('${from}');`;
    });

    index = toImports('./App.js', get('src/App.js')) + index;
    set('dist/index.js', index);
    // rebuildVendor();
    console.timeEnd('rebuild');

    // child_process.execSync('osascript ~/apples/fast.scpt');
    child_process.execSync('osascript ~/apples/chrome.reload.scpt');
}

rebuildVendor();
rebuild();
