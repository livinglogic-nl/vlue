
const fs = require('fs');
const child_process = require('child_process');
const chokidar = require('chokidar');
const debounce = require('debounce');

const chrome = require('./chrome');

const rebuildVendor = require('./rebuild-vendor');

const get = (file) => fs.readFileSync(file).toString();
const set = (file,cnt) => fs.writeFileSync(file, cnt);

const sourceExtensions = {};
const toImports = require('./to-imports');

fs.copyFile('src/index.html', 'dist/index.html', e => {});


const handleVue = (str, styles) => {
    let template = str.match(/<template>([\s\S]+)<\/template>/)[1];
    let script = str.match(/<script>([\s\S]+)<\/script>/)[1];
    let style = str.match(/<style>([\s\S]+)<\/style>/)[1];
    script = script.replace(
        'export default {', 
        `export default {
    template: \`${template}\`,`);
    str = script;

    styles.push(style);
    return str;
}

const handleImports = (str, vendors, locals, todo) => {
    return str.replace(/import (.*?) from '(.+?)';/g, (all, as, from) => {
        if(from.indexOf('.') !== 0) {
            vendors.add(from);
        } else {
            from = from.replace('.', 'src');
            if(!from.includes('.')) {
                from = sourceExtensions[from];
            }
            if(!locals.has(from)) {
                locals.add(from);
                todo.push(from);
            }
        }
        return `const ${as} = vuelImport('${from}');`;
    });
}

let prevIndex = null;

const rebuild = async() => {
    const vendors = new Set();
    const locals = new Set();

    const root = 'src/index.js';
    const todo = [ root ];

    const styles = [];
    let index = '';
    let init;
    while(todo.length) {
        let path = todo.shift();
        let str = get(path);
        if(path.includes('.vue')) {
            str = handleVue(str, styles);
        }

        str = handleImports(str, vendors, locals, todo);
        if(path !== root) {
            index += toImports(path, str);
        } else {
            index += toImports(path, str);
        }
    }
    index += `
    vuelImport('src/index.js');
    `;

    if(index !== prevIndex) {
        set('dist/index.js', index);
        rebuildVendor(vendors);
        chrome.rescript();
        prevIndex = index;
    }

    var style = styles.join('\n');
    set('dist/style.css', style);
    chrome.restyle();
}

const lazyRebuild = debounce(rebuild,40);
chokidar.watch('./src', {ignored: /(^|[\/\\])\../}).on('all', (event, path) => {
    if(event === 'change') {
        console.log(event, path);
        rebuild();
    } else if(event === 'add') {
        sourceExtensions[ path.substr(0, path.lastIndexOf('.')) ] = path;
        lazyRebuild();
    }
});

