const path = require('path');
const log = require('./log');

const micro = require('micro')
const fs = require('fs');
const detect = require('detect-port');


let server;
let map = {
}
const start = async() => {
    log.info('starting server');
    server = micro(async (req, res) => {
        let { url } = req;
        if(url === '/') {
            url = '/index.html';
        }
        if(url.includes('.html')) {
            res.setHeader('Content-Type', 'text/html');
        }
        if(url.includes('.css')) {
            res.setHeader('Content-Type', 'text/css');
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
                fs.readFile(url.substr(1), (e,cnt) => {
                    micro.send(res, 200, cnt);
                });
                return;
            } catch(e) {
            }
        }
        micro.send(res, 404, 'File not found');
    })
    server.on('error', (e) => {
        log.error('server error', e);
    });
    server.listen(8080, () => {
        log.info('server listening');
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
