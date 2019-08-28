const rebuildVendor = require('./rebuild-vendor');
const rebuildSource = require('./rebuild-source');
const server = require('./server');
const setsEqual = require('./sets-equal');
const sass = require('node-sass');

let prevSource = null;
let prevVendors = null;
let prevStyle = null;

module.exports = async(file, sourceExtensions) => {
    const result = await rebuildSource(sourceExtensions);
    const changes = {};
    let { entries, vendors, styles } = result;
    let source = entries.map(e => e.str ).join('');
    if(source !== prevSource) {
        prevSource = source;
        source += `vuelImport('src/index.js');`;

        delete require.cache[ require.resolve('./source-map') ];
        sourceMap = require('./source-map');
        const map = sourceMap.create(entries);
        source += sourceMap.sourceMappingURL(map);

        server.add('/index.js', source);
        if(!prevVendors || !setsEqual(vendors, prevVendors)) {
            const vendor = rebuildVendor(vendors);
            server.add('/vendor.js', vendor);
            prevVendors = vendors;
            changes.vendor = true;
        }
        changes.source = file ? file : null;
    }

    const style = styles.join('\n');
    if(style != prevStyle) {
        prevStyle = style;
        if(style) {
            const result = sass.renderSync({
                data: style,
            });
            server.add('/style.css', result.css);
            changes.style = true;
        }
    }
    return changes;
}
