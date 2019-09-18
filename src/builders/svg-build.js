module.exports = (entry, styles) => {
    const svg = entry.code;
    const dataUri = svgToDataurl(svg)
        .replace(/\(/g,'%28')
            .replace(/\)/g,'%29');
    entry.code = 'module.exports = "'+dataUri+'"';
}
