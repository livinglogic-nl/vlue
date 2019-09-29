module.exports = (str) => {
    return str.replace(/(global\.)?process\.env\.(\w+)/g, (all, global, key) => {
        return "'" + process.env[key] +"'";
    });
}
