const log = require('./log');
const path = require('path');
const fs = require('fs');

const filters = [
    (file) => file.includes('.common'),
    (file) => file.includes('.dev'),
    (file) => file.match(/\.js$/),
];

module.exports = (vendor) => {
    let files;
    let dir = 'dist/';
    try {
        files = fs.readdirSync(path.join('node_modules', vendor, 'dist'));
    } catch(e) {
        dir = '';
        files = fs.readdirSync(path.join('node_modules', vendor));
    }
    for(let i=0; i<filters.length; i++) {
        let test = files.filter( filters[i] );
        if(test.length>0) {
            files = test;
        }
        if(files.length === 1) {
            break;
        }
    }
    log.trace(vendor, 'resolved to', files[0]);
    return dir + files[0];
}
