module.exports = (entry, styles) => {
    let [ script, rest ] = entry.str.split('</script>');
    script = script.replace('<template>', 'const template = `');
    script = script.replace('</template>', '`');
    script = script.replace('<script>', '');
    script = script.replace('export default {', 'export default { template,');

    let style = rest.match(/<style[^>]*>\n([\s\S]+)<\/style>/);
    if(style) {
        styles.push(style[1]);
    }
    entry.str = script;
}
