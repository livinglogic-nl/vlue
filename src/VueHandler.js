const sass = require('node-sass');
const Handler = require('./Handler');

const tagContents = (entry, tag) => {
    const re = new RegExp('<'+tag+'[^>]*>([\\s\\S]+)</'+tag+'>');
    const match = entry.source.match(re);
    if(match) {
        return match[1];
    } else {
        return null;
    }
}

module.exports = class VueHandler extends Handler {
    detectChanges(entry, sourceBundler, vendorBundler) {
        const template = tagContents(entry, 'template');
        const script = tagContents(entry, 'script');
        const style = tagContents(entry, 'style');

        const obj = sourceBundler.getMemory(entry);
        if(obj.template !== template) {
            // TODO: fix rerender problem, then switch to vue.rerender
            entry.updateMethod = 'vue.reload';
        }
        if(obj.script !== script) {
            entry.updateMethod = 'vue.reload';
        }

        if(obj.style !== style) {
            if(style) {
                // TODO: maybe delay sass rendering?
                const result = sass.renderSync({
                    data: style,
                });
                sourceBundler.addStyle({
                    name: entry.name + '.css',
                    code: result.css.toString(),
                });
            }
        }

        sourceBundler.setMemory(entry, {
            template,
            script,
            style,
        });
        return entry.updateMethod !== undefined;
    }
    process(entry, sourceBundler) {
        // TODO: maybe use memoryMap?
        let [ script, rest ] = entry.code.split('</script>');
        script = script.replace('<script>\n', '');

        if(script.includes('<template>')) {
            script = script.replace(/^<template>/m, 'const template = `');
            script = script.replace(/^<\/template>/m, '`');
            script = script.replace('export default {', 'export default { template,');
        }
        entry.code = script;
    }
};
