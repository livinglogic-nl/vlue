const fs = require('fs');
const vlq = require('vlq');

const { SourceMapGenerator } = require('source-map');
const { parse } = require('acorn');

const chrome = require('./chrome');

const getMappings = (e) => {
    const mappings = [];

    const lines = e.source.split('\n');
    const start = lines.indexOf('<script>') + 1;
    const end = (start>0) ? lines.indexOf('</script>') : lines.length;
    if(start>0) {
        mappings.push( ...Array(4).fill('') ); // export line + 3 other lines?
    } else {
        mappings.push(''); // export line
    }

    let lastLine = 1;
    let lastCol = 0;
    for(let i=start; i != end; i++) {
        const match = lines[i].match(/\S/);
        if(match) {
            const line = i+1;
            const column = match.index;
            const obj = { line, column };
            let offsetLine = line - lastLine; lastLine = line;
            let offsetCol = column - lastCol; lastCol = column;
            mappings.push(vlq.encode([column,0,offsetLine, offsetCol]));
        } else {
            mappings.push('');
        }
    }
    return mappings.join(';');
};

const getLineCount = (str) => {
    let length = 1;
    let p = -1;
    while ((p = str.indexOf('\n', p + 1)) != -1) { length++; }
    return length;
}

const create = (entries) => {
    const sections = [];

    let offset = 0;
    entries.forEach(entry => {
        let len = getLineCount(entry.code);
        sections.push({
            offset: { line:offset, column:0 },
            map: {
                version:3,
                file:'index.js',
                sources: [ entry.url ],
                sourcesContent: [ entry.source ],
                mappings: getMappings(entry),
            }
        });
        offset += (len-1);

    });
    return {
        version: 3,
        sections,
    };
}


const sourceMappingURL = (sourceMap) => {
    const base64 = Buffer.from(JSON.stringify(sourceMap)).toString('base64');
    return '//# sourceMappingURL=data:application/json;base64,'+ base64;
}

module.exports = {
    create,
    sourceMappingURL,
}
