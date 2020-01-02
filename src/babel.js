const finishUrl = require('./finish-url');
const resolve = require('./resolve');
const log = require('./log');
const fs = require('fs');
const path = require('path');

const replaceRequires = (str, todo, dir) => {
    return str.replace(/^require\(.(.+).\)/g, (all, url) => {
        console.log(str, {url});
        url = finishUrl(url, dir);
        todo.push(url);
        return `vlueImport('${url}')`;
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
    let polyFills = new Set;
    scripts = scripts.map(script => {
        let transformed = babel.transform(sentinel + script).code;
        let index = transformed.indexOf(sentinel);
        transformed.substr(0,index).split('\n').forEach(line => polyFills.add(line));
        let after = transformed.substr(sentinel + sentinel.length);
        after = replaceRequires(after, todo);
        return after;
    });
    let [ vendor, script ] = scripts;

    const sharedPolyfills = replaceRequires([...polyFills].join('\n'), todo);

    const map = {};
    while(todo.length) {
        const url = todo.shift();
        if(!map[url]) {
            let str = fs.readFileSync(url).toString();
            str = replaceRequires(str, todo, path.dirname(url));
            map[url] = str;
        }
    }

    let added = '';
    Object.entries(map).forEach(([url,code]) => {
        added += `vlueImports['${url}'] = (function() { var exports = {}; var module = { exports:exports };
${code}
return module.exports;});
`;
    });

    added += sharedPolyfills;
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
