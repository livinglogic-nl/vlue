const sass = require('node-sass');
module.exports = (entry, styles) => {
    let [ script, rest ] = entry.str.split('</script>');
    script = script.replace('<script>\n', '');

    if(script.includes('<template>')) {
        script = script.replace(/^<template>/m, 'const template = `');
        script = script.replace(/^<\/template>/m, '`');
        script = script.replace('export default {', 'export default { template,');
    }

    if(rest) {
        let style = rest.match(/<style[^>]*>\n([\s\S]+)<\/style>/);
        if(style) {
            const result = sass.renderSync({
                data: style[1],
            });
            styles.push({
                name: entry.name + '.css',
                str:result.css.toString(),
            });
        }
    }
    entry.str = script;


}
