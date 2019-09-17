module.exports = (entry) => {
    let { str } = entry;
    str = str.replace('export default', 'module.exports =');
    str = `vuelImports['${entry.name}'] = (() => { var exports = {}; var module = { exports };
${str}
return module.exports;});
`;
    entry.str = str;
};
