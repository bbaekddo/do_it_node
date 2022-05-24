console.log('handler info 파일 로딩됨');

const handlerInfo = [
    { file: `./echo`, method: 'echo' },
    { file: './echoError', method: 'echoError'},
    { file: './add', method: 'add'}
];

module.exports = handlerInfo;