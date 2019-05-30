module.exports = (entry, styles) => {
    let { str } = entry;
    let template = str.match(/<template>([\s\S]+)<\/template>/)[1];
    let script = str.match(/<script>([\s\S]+)<\/script>/)[1];
    let style = str.match(/<style>([\s\S]+)<\/style>/)[1];
    script = script.replace(
        'export default {', 
        `export default {
    template: \`${template}\`,`);
    str = script;

    styles.push(style);
    entry.str = str;
}
