const path = require('path');
const fs = require('fs');
const NotFoundError = require('./not-found-error');
const extensions = [ '', '.js', '.vue', '/index.js' ];
module.exports = (url) => {
    let code = null;
    let name;
    extensions.some(ext => {
        try {
            code = fs.readFileSync(url+ext).toString().trim();
            name = url+ext;
            return true;
        } catch(e) {}
        return false;
    });
    if(code !== null) {
        return {
            url,
            ext: path.extname(url).substr(1),
            source: code,
            code,
            name,
        };
    }
    throw new NotFoundError(url);
}
