const finishUrl = require('./finish-url');
const Entry = require('./Entry');
const sass = require('node-sass');
const Handler = require('./Handler');



module.exports = class SassHandler extends Handler {
    prepare(entry, sourceBundler, vendorBundler) {
        entry.code = entry.code.replace(/@import "([^"]+)"/g, (all, file) => {
            let url = file;
            if(url.indexOf('.') !== 0) {
                url = './'+file;
            }
            url = finishUrl(url, entry.url);
            return `@import "${url}"`;
        });
        // entry.code = entry.code.replace(/url()/g, (all, file) => {
        //     let url = file;
        //     if(url.indexOf('.') !== 0) {
        //         url = './'+file;
        //     }
        //     url = finishUrl(url, entry.url);
        //     return `@import "${url}"`;
        // });
        const result = sass.renderSync({ data: entry.code, });
        sourceBundler.addStyle(new Entry(entry.url + '.css', result.css.toString()));
        return true;
    }
    finish(entry, sourceBundler, vendorBundler) {
    }
}

