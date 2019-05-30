

const vlq = require('vlq');

const lines = (str) => str.split('\n').length -1;
module.exports = (entries) => {
    const sources = [];
    const sections = [];
    entries.forEach((e,ei) => {
        if(e.path.includes('.vue')) {
            const len = lines(e.str) - 2 - 2;
            console.log({len});

            const skipTags = 3;
            const templateLines = lines(e.source.match(/<template>[\s\S]*<\/template/)[0]) - 1;
            const upToExportLines = lines(e.str.substr(0,e.str.indexOf('module.exports'))) - skipTags;
            console.log({
                skipTags,
                templateLines,
                upToExportLines,
            });
            console.log(e.str.split('\n').map((s,i) => i + ' '+s).join('\n'));
            sections.push('','');
            sections.push(''); //extra for script tag

            let offset = -10 + templateLines;
            console.log(offset);
            sections.push( vlq.encode([0,1,offset,0]) );
            sections.push(...Array(upToExportLines).fill('AACA'));

            //skip template area
            sections.push(''); //<template>
            sections.push(...Array(templateLines).fill(''));
            sections.push(''); //</template>

            let rest = len - templateLines - upToExportLines - skipTags;
            sections.push(...Array(rest).fill('AACA'));
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
