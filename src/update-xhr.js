const fs = require('fs');
const path = require('path');
const log = require('./log');

const chrome = require('./chrome');
module.exports = async() => {
    const page = await chrome.getPage();
    page.xhr.clear();

    const xhrDir = path.join(process.cwd(), 'mock/xhr'); 
    const xhrIndex = path.join(xhrDir,'index.js');
    if(!fs.existsSync(xhrIndex)) {
        log.tip('You can mock XHR requests by adding mock/xhr/index.js');
        return;
    }

    // TODO: smarter way to clear xhr cache by dependency map
    Object.keys(require.cache).forEach(key => {
        if(key.includes('mock/xhr')) {
            delete require.cache[key];
        }
    });

    const index = require(xhrIndex);
    page.xhr.push(index);


}
