const add = (params, callback) => {
    console.log(`JSON-RPC add 호출됨`);
    console.dir(params);
    
    // 파라미터 체크
    if (params.length < 2) {
        callback({
            code: 400,
            message: 'Insufficient Parameters'
        }, null);
    }
    
    const a = params[0];
    const b = params[1];
    const output = a + b;
    
    callback(null, output);
};

module.exports = add;