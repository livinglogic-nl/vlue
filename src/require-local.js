const path = require('path');
module.exports = (mod) => {
    return require(path.join(process.cwd(), 'node_modules', mod));
}
