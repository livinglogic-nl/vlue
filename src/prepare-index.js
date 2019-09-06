const NotFoundError = require('./not-found-error');
const fs = require('fs');
module.exports = () => {
    const file = 'src/index.html';
    let html;
    try {
        html = fs.readFileSync(file).toString();
    } catch(e) {
        throw new NotFoundError(file);
    }
    html = html.replace('</head>', `
    <link rel="stylesheet" href="style.css" data-name="vuel" />
    </head>`);

    html = html.replace('</body>', `
    <script src="vendor.js"></script>
    <script src="index.js"></script>
    </body>`);

    return html;
}
