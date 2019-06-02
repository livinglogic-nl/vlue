
const micro = require('micro')
const fs = require('fs');

let server;
let map = {
}
const start = () => {
    server = micro(async (req, res) => {
        let { url } = req;
        if(url in map) {
            if(url.includes('.css')) {
                res.setHeader('Content-Type', 'text/css');
            }
            return map[url];
        }
        try {
            const cnt = fs.readFileSync('static/'+url);
            return cnt;
        } catch(e) {
        }
        console.log(url, 'not found');
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
