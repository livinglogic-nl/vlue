

const vlq = require('vlq');
const lines = require('./get-line-count');

const addVueSourcemap = require('./add-vue-sourcemap');
module.exports = (entries) => {
    const sources = [];
    const sections = [];
    entries.forEach((e,ei) => {
        if(e.path.includes('.vue')) {
            addVueSourcemap(e, sections);
            return;
        }
        sections.push('','');
        const [so,lo] = ei === 0 ? [0,0] : [1,-1];
        sections.push( vlq.encode([0,so,lo,0]) );
        const len = lines(e.source);
        sections.push(...Array(len).fill('AACA'));
    });

    const sourceMap = {
        version: 3,
        names: [],
        file: 'index.js',
        sources: entries.map(e => e.path),
        sourcesContent: entries.map(e => e.source),
        mappings: sections.join(';'),
    };
    const url = 'data:application/json;base64,'
        +Buffer.from(JSON.stringify(sourceMap)).toString('base64');
    return '//# sourceMappingURL='+url;
};
