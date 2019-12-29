const NotFoundError = require('./not-found-error');
const fs = require('fs');
const path = require('path');

module.exports = class Entry {
    constructor(url, code = null, name = url) {
        this.url = url;
        this.name = name;
        this.ext = path.extname(url).substr(1);

        if(code === null) {
            try {
                this.raw = fs.readFileSync(url)
                code = this.raw.toString().trim();
            } catch(e) {
                throw new NotFoundError(url);
            }
        }
        this.source = code;
        this.code = code;
        this.contexts = [];
    }
}
