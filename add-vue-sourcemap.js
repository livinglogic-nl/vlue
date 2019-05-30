const vlq = require('vlq');
const lines = require('./get-line-count');
module.exports = (e, sections) => {
    const len = lines(e.str) - 2 - 2;
    const skipTags = 3;
    const templateLines = lines(e.source.match(/<template>[\s\S]*<\/template/)[0]) - 1;
    const upToExportLines = lines(e.str.substr(0,e.str.indexOf('module.exports'))) - skipTags;

    sections.push('','');
    sections.push(''); //extra for script tag

    //TODO: where does magic number come from?
    let offset = -10 + templateLines;
    sections.push( vlq.encode([0,1,offset,0]) );
    sections.push(...Array(upToExportLines).fill('AACA'));

    //skip template area
    sections.push(''); //<template>
    sections.push(...Array(templateLines).fill(''));
    sections.push(''); //</template>

    //handle rest of script
    let rest = len - templateLines - upToExportLines - skipTags;
    sections.push(...Array(rest).fill('AACA'));

}
