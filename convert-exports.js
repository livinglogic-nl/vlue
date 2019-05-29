module.exports = (entry) => {
    let { str } = entry;
    str = str.replace('export default', 'module.exports =');
    str = `vuelImports['${entry.name}'] = (function() {
var module = {};
${str}return module.exports;});
`;
    entry.str = str;
};
