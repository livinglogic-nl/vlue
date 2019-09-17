const crypto = require('crypto');
const fs = require('fs');
const NotFoundError = require('./not-found-error');


module.exports = ({ isDev, changes }) => {
    let cacheBust;
    if(isDev) {
        cacheBust = (filename) => filename;
    } else {
        cacheBust = (filename, source) => {
            const hash = crypto.createHash('md5').update(source).digest('hex');
            return filename + '?'+hash;
        }
    }

    let html;
    const file = 'src/index.html';
    try {
        html = fs.readFileSync(file).toString();
    } catch(e) {
        throw new NotFoundError(file);
    }

    if(isDev) {
        const styles = changes.styles.map(s => {
            return `<style data-name="${s.name}">\n${s.str}</style>`;
        }).join('');
        html = html.replace('</head>', styles + '</head>');
    } else {
        const link = `<link rel="stylesheet" href="${cacheBust('style.css', changes.style)}" data-name="vuel" />\n`;
        html = html.replace('</head>', link + '</head>');
    }

    const scriptFiles = [
        'vuel-support.js',
        cacheBust('vendor.js', changes.vendor),
        cacheBust('index.js', changes.source),
    ];

    html = html.replace(
        '</body>',
        scriptFiles.map(file => '\t<script src="'+file+'"></script>').join('\n') + '\n</body>'
    );

    return html;
}
