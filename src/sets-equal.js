module.exports = (a,b) => {
    if(a.size !== b.size) { return false; }
    for(let key of a) {
        if(!b.has(key)) { return false; }
    }
    return true;
}
