const fs = require('fs');

try {
    if (!fs.existsSync('src')) {
        throw Error('No src/ folder found in this directory');
    }
    if (!fs.existsSync('src/index.html')) {
        throw Error('No src/index.html file found');
    }
    if (!fs.existsSync('src/index.js')) {
        throw Error('No src/index.js file found');
    }
} catch(e) {
    console.log(e.message);
    process.exit(0);
}

