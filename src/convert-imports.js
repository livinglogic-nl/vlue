module.exports = (extensionMap, entry, vendors, locals, todo) => {
    entry.str = entry.str.replace(/import (.*?) from '(.+?)';/g, (all, as, from) => {
        if(from.indexOf('.') !== 0) {
            vendors.add(from);
        } else {
            from = from.replace('.', 'src');
            if(!from.includes('.')) {
                from = extensionMap[from];
            }
            if(!locals.has(from)) {
                locals.add(from);
                todo.push(from);
            }
        }
        return `const ${as} = vuelImport('${from}');`;
    });
}
