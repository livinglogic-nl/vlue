const log = require('./log');
const fs = require('fs');
const path = require('path');
const convertExports = require('./convert-exports');
const convertImports = require('./convert-imports');
const Entry = require('./Entry');
const Handler = require('./Handler');
const { compileTemplate } = require('@vue/component-compiler-utils');

const tagContents = (entry, tag) => {
    const re = new RegExp('<'+tag+'[^>]*>([\\s\\S]+)</'+tag+'>');
    const match = entry.source.match(re);
    if(match) {
        return match[1];
    } else {
        return null;
    }
}


let vueTemplateCompiler = null;
const getCompiled = (template, filename) => {
    if(!vueTemplateCompiler) {
        const url = path.join('node_modules', 'vue-template-compiler');
        if(!fs.existsSync(url)) {
            log.tip('For enhanced performance: npm install vue-template-compiler');
            return null;
        }
        vueTemplateCompiler = require(path.join(process.cwd(), url));
    }

    const compiled = compileTemplate({
        source: template,
        filename: filename,
        compiler: vueTemplateCompiler,
        transformAssetUrls: false,
        isFunctional: false,
        isProduction: true,
        optimizeSSR: false,
    })
    return compiled;
}

module.exports = class VueHandler {
    detectChange(entry, sourceBundler, vendorBundler) {
        const template = tagContents(entry, 'template');
        const script = tagContents(entry, 'script');
        const style = tagContents(entry, 'style');

        const obj = sourceBundler.getMemory(entry);
        if(obj.template !== template) {
            entry.updateMethod = vueTemplateCompiler ? 'vue.rerender' : 'vue.reload';
        }
        if(obj.script !== script) {
            entry.updateMethod = 'vue.reload';
        }

        if(obj.style !== style) {
            if(style) {
                sourceBundler.addTodo(entry.url+'.scss', style);
            }
        }
        sourceBundler.setMemory(entry, {
            template,
            script,
            style,
        });

        return entry.updateMethod !== undefined;
    }

    prepare(entry, sourceBundler, vendorBundler) {
        let { template, script, style } = sourceBundler.getMemory(entry);
        if(template) {
            template = template.replace(
                / src=.(\.[^"']+)./g,
                (all,url) => ` src="${sourceBundler.requestUrl(entry, url)}"`)
        }

        if(template !== null) {
            const compiled = getCompiled(template);
            if(compiled) {
                script = compiled.code + script.replace('export default {', 'export default { render, staticRenderFns,')
            } else {
                script = script.replace('export default {', 'export default { template:`'+template+'`,');
            }
        }
        entry.code = script;

        convertImports(entry, sourceBundler, vendorBundler);
        convertExports(entry);
        sourceBundler.addScript(entry);
    }

    finish(entry, sourceBundler, vendorBundler) {
        sourceBundler.resolveUrls(entry);
    }
};
