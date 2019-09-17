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
        url = url.replace(/%20/g, ' ');
        if(url in map) {
            return map[url];
        }

        if(url.indexOf('/static') === 0) {
            try {
                const cnt = fs.readFileSync('static/'+url.substr(8));
                return cnt;
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
module.exports = {
    start,
    stop,
    add,
};
