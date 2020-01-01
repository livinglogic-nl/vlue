module.exports = (entry) => {
    let { code } = entry;
    code = code.replace('export default', 'module.exports =');
    code = `vlueImports['${entry.name}'] = (() => { var exports = {}; var module = { exports };
${code}
return module.exports;});
`;
    entry.code = code;
};
