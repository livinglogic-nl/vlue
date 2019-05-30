const lines = require('./get-line-count');

const create = (entries) => {
    const sections = [];

    let offset = 0;
    entries.forEach(e => {
        const len = lines(e.str);
        sections.push({
            offset: { line:offset, column:0 },
            map: {
                version:3,
                file:'index.js',
                sources: [ e.path ],
                sourcesContent: [ e.source ],
                mappings: mappings = [
                    '',
                    '',
                    'AAAA',
                    ...Array(len).fill('AACA'),
                ].join(';')
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
