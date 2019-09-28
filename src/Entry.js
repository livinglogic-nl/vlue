const fs = require('fs');
const path = require('path');

module.exports = class Entry {
    constructor(url) {
        this.url = url;
        this.ext = path.extname(url).substr(1);
        const code = fs.readFileSync(url).toString().trim();
        this.source = code;
        this.code = code;
    }

    get name() {
        return this.url;
    }
}
