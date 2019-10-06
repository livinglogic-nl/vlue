module.exports = (roots, name, callback) => {
    for(let i=0; i<roots.length; i++) {
        if(roots[i].indexOf(name) === 0) {
            roots.splice(i,1);
            callback();
        }
    }
};

