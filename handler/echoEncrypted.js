const cryptoJS = require('crypto-js');

const echoEncrypt = (params, callback) => {
    console.log(`JSON-RPC echo encrypted 호출됨`);
    console.dir(params);
    
    try {
        // 복호화 테스트
        let encrypted = params[0];
        const secret = 'my secret';
        const decrypted = cryptoJS.AES.decrypt(encrypted, secret).toString(cryptoJS.enc.Utf8);
    
        console.log(`복호화된 데이터 ${decrypted}`);
        
        // 암호화 테스트
        encrypted = '' + cryptoJS.AES.encrypt(`${decrypted} -> 서버에서 보냄`, secret);
    
        console.log(encrypted);
        params[0] = encrypted;
    } catch (error) {
        console.dir(error);
        console.log(error.stack);
    }
    
    callback(null, params);
};

module.exports = echoEncrypt;
