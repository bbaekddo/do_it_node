console.log('handler info 파일 로딩됨');

const handlerInfo = [
    { file: `./echo`, method: 'echo' },
    { file: './echoError', method: 'echoError'},
    { file: './add', method: 'add'},
    { file: './listUser', method: 'listUser'},
    { file: './echoEncrypted', method: 'echoEncrypted'}
];

module.exports = handlerInfo;