
const micro = require('micro')

let server;
let map = {
}
const start = () => {
    server = micro(async (req, res) => {
        let { url } = req;
        if(map[url]) {
            return map[url];
        }
        return '404'
    })
    server.listen(8080);
    console.log('go');
}

const add = (path, content) => {
    map[path] = content;
}
module.exports = {
    start,
    add,
};
