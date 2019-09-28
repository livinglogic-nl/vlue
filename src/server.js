const path = require('path');
const log = require('./log');

const micro = require('micro')
const fs = require('fs');
const detect = require('detect-port');


let server;
let map = {
}
const start = async(port) => {
    server = micro(async (req, res) => {
        let { url } = req;
        if(url === '/') {
            url = '/index.html';
        }
        if(url === '/favicon.ico') {
            return fs.createReadStream(path.join(__dirname,'default-favicon.ico'));
        }
        if(url.includes('.html')) {
            res.setHeader('Content-Type', 'text/html');
        }
        if(url.includes('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
        if(url.includes('.js')) {
            res.setHeader('Content-Type', 'text/javascript');
        }
        const p = url.split('?')[0];
        let result = map[p];
        if(result) {
            if(typeof(result) === 'function') {
                return result();
            }
            return result;
        }

        if(p.indexOf('/static') === 0) {
            try {
                url = url.replace(/%20/g, ' ');
                const stream = fs.createReadStream(url.substr(1));
                micro.send(res, 200, stream);
                return;
            } catch(e) {
            }
        }
        micro.send(res, 404, 'File not found');
    })
    server.on('error', (e) => {
        log.error('server error', e);
    });
    server.listen(port, () => {
        log.info('server listening on port ' + port);
    });
}

const stop = () => {
    server.close();
}

const add = (path, content) => {
    map[path] = content;
}
const addCallback = (path, content) => {
    map[path] = content;
}
module.exports = {
    start,
    stop,
    add,
    addCallback,
};
