
const fs = require('fs');
const child_process = require('child_process');
const chokidar = require('chokidar');
const debounce = require('debounce');

const chrome = require('./chrome');

const rebuildVendor = require('./rebuild-vendor');

const get = (file) => fs.readFileSync(file).toString();
const set = (file,cnt) => fs.writeFileSync(file, cnt);
const localGet = (file) => get(file); //.replace(/const /g, 'var ');


const sourceExtensions = {
};
const toImports = require('./to-imports');

fs.copyFile('src/index.html', 'dist/index.html', e => {});


const rebuild = async() => {
    const vendors = new Set();
    const locals = new Set();

    const root = 'src/index.js';
    const todo = [ root ];

    let index = '';
    let init;
    while(todo.length) {
        let path = todo.shift();
        let str = localGet(path);
        str = str.replace(/import (.*?) from '(.+?)';/g, (all, as, from) => {
            if(from.indexOf('.') !== 0) {
                vendors.add(from);
            } else {
                //resolve
                from = from.replace('.', 'src');
                if(!from.includes('.')) {
                    console.log(from);
                    from = sourceExtensions[from];
                    console.log(from);
                }
                if(!locals.has(from)) {
                    locals.add(from);
                    todo.push(from);
                }
            }
            return `const ${as} = vuelImport('${from}');`;
        });

        if(path !== root) {
            index += toImports(path, str);
        } else {
            // init = str;
            index += toImports(path, str);
        }
    }
    index += `
    vuelImport('src/index.js');
    `;


    // index += init;
    set('dist/index.js', index);
    rebuildVendor(vendors);

    await chrome.rescript();
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

