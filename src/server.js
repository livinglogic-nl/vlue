
const micro = require('micro')
const fs = require('fs');

let server;
let map = {
}
const start = () => {
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
        return '404'
    })
    server.listen(8080);
}

const add = (path, content) => {
    map[path] = content;
}
module.exports = {
    start,
    add,
};
