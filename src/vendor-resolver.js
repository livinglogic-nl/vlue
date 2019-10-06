const log = require('./log');
const path = require('path');
const fs = require('fs');
const vuelSettings = require('./vuel-settings');


const filters = [
    // (file) => file.includes('.common'),
    // (file) => file.includes('.dev'),

    (file) => !file.includes('.esm'),
    (file) => file.includes('.min'),

    (file) => file.match(/\.js$/),
];

module.exports = (vendor) => {
    const map = vuelSettings.resolve;
    if(map[vendor]) {
        return map[vendor];
    }
    let files;
    let subdir = 'dist' + path.sep;

    const vendorPath = path.join('node_modules', vendor);
    const bullsEye = subdir + vendor + '.min.js';
    if(fs.existsSync(path.join(vendorPath,bullsEye))) {
        return bullsEye;
    }
    try {
        files = fs.readdirSync(path.join(vendorPath, 'dist'));
    } catch(e) {
        // no dist folder
        subdir = '';
        try {
            const packageJson = fs.readFileSync(path.join(vendorPath,'package.json'))
            const { browser } = JSON.parse(packageJson);
            if(!browser) {
                throw Error('no browser field defined');
            } 
            files = [
                Object.values(browser)[0]
            ];

        } catch(e) {
            files = fs.readdirSync(path.join('node_modules', vendor));
        }
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
    return subdir + files[0];
}
