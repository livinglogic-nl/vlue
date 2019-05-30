const fs = require('fs');
const get = (file) => fs.readFileSync(file).toString();
const set = (file,cnt) => fs.writeFileSync(file, cnt);

module.exports = () => {
    if(!fs.existsSync('dist')) {
        fs.mkdirSync('dist');
    }
    let html = get('src/index.html');
    html = html.replace('</head>', `
    <link rel="stylesheet" href="style.css" data-name="vuel" />
    </head>`);

    html = html.replace('</body>', `
    <script src="vendor.js"></script>
    <script src="index.js"></script>
    </body>`);

    return html;
}
