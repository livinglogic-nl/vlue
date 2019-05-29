
const fs = require('fs');
const child_process = require('child_process');
const chokidar = require('chokidar');
const debounce = require('debounce');

const chrome = require('./chrome');
const rebuildVendor = require('./rebuild-vendor');
const generateSourcemap = require('./generate-sourcemap');

const get = (file) => fs.readFileSync(file).toString();
const set = (file,cnt) => fs.writeFileSync(file, cnt);

const sourceExtensions = {};
const convertExports = require('./convert-exports');

const prepareIndex = require('./prepare-index');
prepareIndex();

const handleVue = (entry, styles) => {
    let { str } = entry;
    let template = str.match(/<template>([\s\S]+)<\/template>/)[1];
    let script = str.match(/<script>([\s\S]+)<\/script>/)[1];
    let style = str.match(/<style>([\s\S]+)<\/style>/)[1];
    script = script.replace(
        'export default {', 
        `export default {
    template: \`${template}\`,`);
    str = script;

    styles.push(style);
    entry.str = str;
}

const convertImports = (entry, vendors, locals, todo) => {
    entry.str = entry.str.replace(/import (.*?) from '(.+?)';/g, (all, as, from) => {
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
let prevStyle = null;

const rebuild = async() => {
    const vendors = new Set();
    const locals = new Set();

    const root = 'src/index.js';
    const todo = [ root ];
    const entries = [];

    const styles = [];
    let index = '';
    let init;
    while(todo.length) {
        let path = todo.shift();
        const entry = {
            name: path,
            path,
            str: get(path),
        };
        entry.source = entry.str;
        if(path.includes('.vue')) {
            handleVue(entry, styles);
        }
        convertImports(entry, vendors, locals, todo);
        convertExports(entry);
        entries.push(entry);
    }

    entries.forEach(entry => {
        index += entry.str;
    });
    console.log(index.split('\n').map((s,i) => i + ' '+s).join('\n'));

    index += `vuelImport('src/index.js');`;
    index += generateSourcemap(entries);

    if(index !== prevIndex) {
        set('dist/index.js', index);
        rebuildVendor(vendors);
        chrome.rescript();
        prevIndex = index;
    }



    const style = styles.join('\n');
    if(style != prevStyle) {
        set('dist/style.css', style);
        prevStyle = style;
        chrome.restyle();
    }
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

