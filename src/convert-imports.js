const Entry = require('./Entry');
const log = require('./log');
const path = require('path');
const fs = require('fs');

const finishUrl = require('./finish-url');

module.exports = (entry, sourceBundler, vendorBundler) => {
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
            sourceBundler.addTodo(url);
        }
        if(as) {
            return `const ${as} = vuelImport('${url}');`;
        }
        return `vuelImport('${url}');`;
    });
}
