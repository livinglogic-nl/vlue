const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const testDir = path.join(__dirname, '..', 'test');

(async() => {
    const files = fs.readdirSync(testDir).filter(f => f.includes('.spec.js'));
    for await(let file of files) {
        console.log(chalk.blue(file));
        const url = require.resolve( path.join(testDir, file) );
        require(url);
    }
})();


