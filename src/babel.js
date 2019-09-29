const log = require('./log');
const fs = require('fs');
const path = require('path');
const resolve = (a,b) => {
    let full = a + '/' + b;
    full = full.replace(/\/\.\//g, '/');
    full = full.replace(/[^\/]+\/\.\.\//g, '');
    return full;
}

const replaceRequires = (str, todo, dir) => {
    return str.replace(/require\(.(.+).\)/g, (all, url) => {
        url += '.js';
        if(url.charAt(0) === '.') {
            url = resolve(dir, url);
        }
        todo.push(url);
        return `vuelImport('${url}')`;
    });
}

const coreBabelPath = path.join(process.cwd(), 'node_modules', '@babel/core');

const babelify = (sourceBundler, vendorBundler) => {
    const babel = require(coreBabelPath);
    const sentinel = '\n//SENTINEL//\n';
    let scripts = [
        vendorBundler.fullScript,
        sourceBundler.fullScript,
    ];

    const todo = [];
    let beforeLines = new Set;
    scripts = scripts.map(script => {
        let transformed = babel.transform(sentinel + script).code;
        let index = transformed.indexOf(sentinel);
        transformed.substr(0,index).split('\n').forEach(line => beforeLines.add(line));
        let after = transformed.substr(sentinel + sentinel.length);
        after = replaceRequires(after, todo);
        return after;
    });
    let [ vendor, script ] = scripts;

    const sharedBefore = replaceRequires([...beforeLines].join('\n'), todo);

    const map = {};
    while(todo.length) {
        const url = todo.shift();
        if(!map[url]) {
            let str = fs.readFileSync('node_modules/' + url).toString();
            str = replaceRequires(str, todo, path.dirname(url));
            map[url] = str;
        }
    }
    const sorted = Object.entries(map).sort((a,b) => {
        return a[1].length < b[1].length ? 1 : -1
    });
    // console.log(sorted.slice(0,10).map(arr => ({ name:arr[0], size:arr[1].length })));

    let added = '';
    Object.entries(map).forEach(([url,code]) => {
        added += `vuelImports['${url}'] = (function() { var exports = {}; var module = { exports:exports };
${code}
return module.exports;});
`;
    });

    added += sharedBefore;
    return {
        script,
        vendor: added + vendor,
    };
}

const isSupported = () => fs.existsSync(coreBabelPath);
module.exports = {
    babelify,
    isSupported,
}
