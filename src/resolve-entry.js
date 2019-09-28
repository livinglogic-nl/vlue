const finishUrl = require('./finish-url');
const path = require('path');
const fs = require('fs');
const NotFoundError = require('./not-found-error');
const extensions = [ '', '.js', '.vue', '/index.js' ];
module.exports = (url) => {
    const code = fs.readFileSync(url).toString().trim();
    return {
        url,
        ext: path.extname(url).substr(1),
        source: code,
        code,
        name: url
    };
}
