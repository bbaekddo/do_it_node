const listUser = (params, callback) => {
    console.log(`JSON-RPC listUser 호출됨`);
    console.dir(params);
    
    // 데이터베이스 객체 참조
    const globalDB = global.database;
    if (globalDB) {
        console.log(`database 객체 참조됨`);
    } else {
        console.log(`database 객체 불가함`);
        callback({
            code: 410,
            message: `database 객체 불가함`
        }, null);
    }
    
    if (globalDB.db) {
        // 1. 모든 사용자 검색
        globalDB.userModel.findAll((err, results) => {
            if (results) {
                console.log(`결과물 문서 데이터의 개수 ${results.length}`);
                
                const output = [];
                for (let i = 0; i < results.length; i++) {
                    const currentId = results[i]._doc.facebook.id;
                    const currentName = results[i]._doc.facebook.name;
                    output.push({ id: currentId, name: currentName });
                }
                
                callback(null, output);
            }
        });
    }
}

module.exports = listUser;