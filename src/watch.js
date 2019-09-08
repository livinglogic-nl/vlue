const fs = require('fs');

module.exports = (url, callback) => {
    fs.watch(url, { recursive: true }, (event, file) => {
        callback(event, file);
    });
}
