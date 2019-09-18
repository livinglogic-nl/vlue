const fs = require('fs');
module.exports = (entry, vendors, todo, vendorBundler) => {
    entry.code = entry.code.replace(/^import (.+?)?( from )?'(.+?)';?/gm, (all, ...rest) => {
        let as = null, from = null;
        if(rest.length === 5) {
            [as,,from] = rest;
        } else {
            [from] = rest;
        }

        let path = from;
        if(path.indexOf('.') === 0)  {
            let nodes = from.split('/');
            let resolved = entry.url.split('/');
            resolved.pop();
            while(1) {
                if(nodes[0] === '..') {
                    nodes.shift();
                    resolved.pop();
                } else if(nodes[0] === '.') {
                    nodes.shift();
                } else {
                    break;
                }
            }
            resolved.push(...nodes);
            path = resolved.join('/');
        }

        if(path.indexOf('/') === -1) {
            vendors.add(from);
            vendorBundler.add(from);
        } else {
            if(from.charAt(0) === '.') {
                //relative to current entry
                path = require('path').resolve(entry.name, '..', from).substr(process.cwd().length+1);
            } else {
                //subreference to a node_modules folder
                path = require('path').resolve('node_modules', from).substr(process.cwd().length+1);
            }
            if(!todo.includes(path)) {
                if(!fs.existsSync(path) || fs.lstatSync(path).isDirectory()) {
                    const extensions = [ '.js', '.vue', '/index.js' ];
                    let ext = extensions.find(ext => fs.existsSync(path+ext));
                    if(ext) {
                        path += ext;
                    } else {
                        console.log('could not find', path);
                    }
                }
                if(!todo.includes(path)) {
                    todo.push(path);
                }
            }
        }
        if(as) {
            return `const ${as} = vuelImport('${path}');`;
        }
        return `vuelImport('${path}');`;
    });
}
