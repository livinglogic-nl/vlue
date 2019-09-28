const fs = require('fs');
const path = require('path');

module.exports = class Entry {
    constructor(url, code = null, name = url) {
        this.url = url;
        this.name = name;
        this.ext = path.extname(url).substr(1);

        if(code === null) {
            code = fs.readFileSync(url).toString().trim();
        }
        this.source = code;
        this.code = code;
    }
}
