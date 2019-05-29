

const vlq = require('vlq');
module.exports = (entries) => {
    const sources = [];

    let global = 0;
    const sections = [];

    entries.forEach((e,ei) => {
        sections.push('');
        sections.push('');
        const lines = e.source.split('\n');
        for(let i=0; i<lines.length; i++ ){
            let sourceOffset = (i === 0 ? (ei === 0 ? 0 : 1) : 0);
            let offset = (i === 0) ? 0 : 1;
            if(ei > 0 && i === 0) {
                offset = -1;
            }
            sections.push( vlq.encode([0,sourceOffset,offset,0]) );
        }
    });

    const sourceMap = {
        version: 3,
        names: [],
        file: 'index.js',
        sources: entries.map(e => e.path),
        sourcesContent: entries.map(e => e.source),
        mappings: sections.join(';'),
    };
    console.log(sourceMap);
    const url = 'data:application/json;base64,'
        +Buffer.from(JSON.stringify(sourceMap)).toString('base64');
    return '//# sourceMappingURL='+url;
};
