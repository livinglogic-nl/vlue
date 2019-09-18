module.exports = (entry) => {
    let { code } = entry;
    code = code.replace('export default', 'module.exports =');
    code = `vuelImports['${entry.name}'] = (() => { var exports = {}; var module = { exports };
${code}
return module.exports;});
`;
    entry.code = code;
};
