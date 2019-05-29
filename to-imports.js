module.exports = (name, str) => {
    str = str.replace('export default', 'module.exports =');
    return `vuelImports['${name}'] = (function() {
        var module = {};
        ${str}
        return module.exports;
        });
        `;
};
