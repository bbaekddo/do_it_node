const indexOf = function(array, object) {
    let index = -1;
    const keys = Object.keys(object);
    
    const result = array.filter((doc, idx) => {
        let matched = 0;
        
        for (let i = (keys.length - 1); i >= 0; i--) {
            if (doc[keys[i]] === object[keys[i]]) {
                matched++;
                
                if (matched === keys.length) {
                    index = idx;
                    return idx;
                }
            }
        }
    });
    
    return index;
}

module.exports = {
    indexOf
};