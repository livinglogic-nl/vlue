const log = require('./log');
const crypto = require('crypto');
const fs = require('fs');
const NotFoundError = require('./not-found-error');


const hash = (str) => {
    return crypto.createHash('md5').update(str).digest('hex');
}

module.exports = ({ isDev, sourceBundler, vendorScript }) => {
    let html;
    const file = 'src/index.html';
    try {
        html = fs.readFileSync(file).toString();
    } catch(e) {
        log.error('vlue relies on src/index.html');
        return '';
    }

    if(isDev) {
        const styles = Object.values(sourceBundler.styleMap).map(s => {
            return `<style data-name="${s.url}">\n${s.code}</style>`;
        }).join('');
        html = html.replace('</head>', styles + '</head>');
    } else {
        const link = `<link rel="stylesheet" href="style.css?${hash(sourceBundler.fullStyle)}" data-name="vlue" />\n`;
        html = html.replace('</head>', link + '</head>');
    }

    const scriptFiles = [
        'vendor.js?' + hash(vendorScript),
        'index.js?' + hash(sourceBundler.fullScript),
    ];

    html = html.replace(
        '</body>',
        scriptFiles.map(file => '\t<script src="'+file+'"></script>').join('\n') + '\n</body>'
    );

    return html;
}
