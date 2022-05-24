// echo 오류 테스트 함수
const echoError = (params, callback) => {
    console.log(`JSON-RPC echo error 호출됨`);
    console.dir(params);
    
    // 파라미터 체크
    // 파라미터 개수 부족
    if (params.length < 2) {
        callback({
            code: 400,
            message: 'Insufficient Parameters'
        }, null);
    }
    
    const output = `Success`;
    callback(null, output);
};

module.exports = echoError;