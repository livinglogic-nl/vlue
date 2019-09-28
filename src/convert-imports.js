const Entry = require('./Entry');
const path = require('path');
const fs = require('fs');

const finishUrl = require('./finish-url');

module.exports = (entry, todo, vendorBundler) => {
    entry.code = entry.code.replace(/^import (.+?)?( from )?'(.+?)';?/gm, (all, ...rest) => {
        let as = null, from = null;
        if(rest.length === 5) {
            [as,,from] = rest;
        } else {
            [from] = rest;
        }

        let url = from;
        if(url.indexOf('/') === -1) {
            vendorBundler.add(from);
        } else {
            url = finishUrl(url, entry.url);
            const existing = todo.find(e => e.url === url);
            if(!existing) {
                todo.push(new Entry(url));
            }
        }
        if(as) {
            return `const ${as} = vuelImport('${url}');`;
        }
        return `vuelImport('${url}');`;
    });
}
