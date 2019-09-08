const fs = require('fs');
module.exports = (extensionMap, entry, vendors, locals, todo) => {
    entry.str = entry.str.replace(/^import (.+?)?( from )?'(.+?)';?/gm, (all, ...rest) => {
        let as = null, from = null;
        if(rest.length === 5) {
            [as,,from] = rest;
        } else {
            [from] = rest;
        }

        let path = from;
        if(path.indexOf('.') === 0)  {
            let nodes = from.split('/');
            let resolved = entry.path.split('/');
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
        } else {
            path = require('path').resolve(entry.name, '..', from).substr(process.cwd().length+1);
            if(!locals.has(path)) {
                if(!fs.existsSync(path) || fs.lstatSync(path).isDirectory()) {
                    const extensions = [ '.js', '.vue', '/index.js' ];
                    let ext = extensions.find(ext => fs.existsSync(path+ext));
                    if(ext) {
                        path += ext;
                    } else {
                        console.log('could not find', path);
                    }
                }
            }

            if(!locals.has(path)) {
                locals.add(path);
                todo.push(path);
            }
        }
        if(as) {
            return `const ${as} = vuelImport('${path}');`;
        }
        return `vuelImport('${path}');`;
    });
}
