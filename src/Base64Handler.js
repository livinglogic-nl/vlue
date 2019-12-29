const crypto = require('crypto');
const convertExports = require('./convert-exports');
const Handler = require('./Handler');

module.exports = class SvgHandler extends Handler {
    constructor(mimeType) {
        super();
        this.mimeType = mimeType;
    }

    prepare(entry, sourceBundler, vendorBundler) {
        entry.file = true;

        // const hash = crypto.createHash('md5')
        //     .update(entry.source)
        //     .digest("hex");
        // const url = `${hash}.${entry.ext}`;
        
        // sourceBundler.addStatic(url, entry.raw);
        entry.toDataURI = (entry) => {
            // return url;
            return 'data:'+this.mimeType+';base64,'+entry.raw.toString('base64');
        }
        sourceBundler.addScript(entry);
    }
};
