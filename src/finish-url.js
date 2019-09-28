const path = require('path');
const fs = require('fs');
module.exports = (url, fromUrl) => {
    if(url.indexOf('.') === 0)  {
        url = path.resolve(path.dirname(fromUrl), url).substr(process.cwd().length+1);
    } else {
        url = path.resolve('node_modules', url).substr(process.cwd().length+1);
    }
    if(!fs.existsSync(url)) {
        const extensions = [ '.js', '.vue' ];
        let ext = extensions.find(ext => fs.existsSync(url+ext));
        if(ext) {
            url += ext;
        } else {
            console.error('could not find', url);
        }
    } else if(fs.lstatSync(url).isDirectory()) {
        url = url + '/index.js';
    }
    return url;
}
