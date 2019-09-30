const finishUrl = require('./finish-url');
const Entry = require('./Entry');
const sass = require('node-sass');
const Handler = require('./Handler');



module.exports = class SassHandler extends Handler {
    prepare(entry, sourceBundler, vendorBundler) {
        //TODO: should instead todoPush a CSS Entry
        //new Entry(entry.url + '.css', result.css.toString()));
        let code = entry.code.replace(/@import "([^"]+)"/g, (all, file) => {
            let url = file;
            if(url.indexOf('.') !== 0) {
                url = './'+file;
            }
            url = finishUrl(url, entry.url);
            return `@import "${url}"`;
        });

        code = code.replace(
                /url\(.?(\.[^"']+).?\)/g,
                (all,url) => `url(${sourceBundler.requestUrl(entry, url)})`)
        entry.code = code;

        const result = sass.renderSync({ data:code });
        entry.code = result.css.toString();
        sourceBundler.addStyle(entry);

    }
    finish(entry, sourceBundler, vendorBundler) {
        sourceBundler.resolveUrls(entry);
    }
}

