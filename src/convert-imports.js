const path = require('path');
const resolveEntry = require('./resolve-entry');
const fs = require('fs');

const finishUrl = require('./finish-url');

module.exports = (entry, vendors, todo, vendorBundler) => {
    entry.code = entry.code.replace(/^import (.+?)?( from )?'(.+?)';?/gm, (all, ...rest) => {
        let as = null, from = null;
        if(rest.length === 5) {
            [as,,from] = rest;
        } else {
            [from] = rest;
        }

        let url = from;
        if(url.indexOf('/') === -1) {
            vendors.add(from);
            vendorBundler.add(from);
        } else {
            url = finishUrl(url, entry.url);
            const existing = todo.find(e => e.url === url);
            if(!existing) {
                todo.push(resolveEntry(url));
            }
        }
        if(as) {
            return `const ${as} = vuelImport('${url}');`;
        }
        return `vuelImport('${url}');`;
    });
}
