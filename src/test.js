const path = require('path');
const fs = require('fs');
const testDir = path.join(__dirname, '..', 'test');

(async() => {
    const files = fs.readdirSync(testDir).filter(f => f.includes('.spec.js'));
    console.log(files);
    for await(let file of files) {
        const url = require.resolve( path.join(testDir, file) );
        require(url);
    }
})();


