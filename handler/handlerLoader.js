const handlerLoader = {};

const handlerInfo = require('./handlerInfo');
const utils = require('jayson/lib/utils');

handlerLoader.init = (jayson, app, apiPath) => {
    console.log(`handler loader init 호출됨`);
    return initHandlers(jayson, app, apiPath);
}

// hnadlerInfo에 정의된 핸들러 정보 처리
function initHandlers(jayson, app, apiPath) {
    const handlers = {};
    const infoLength = handlerInfo.length;
    console.log(`설정에 정의된 핸들러의 수 : ${infoLength}`);
    
    for (let i = 0; i < infoLength; i++) {
        let currentItem = handlerInfo[i];
        
        // 모듈 파일에서 모듈 불러옴
        const currentHandler = require(currentItem.file);
        console.log(`${currentItem.file} 파일에서 모듈정보를 읽어옴`);
        
        // 핸들러 함수 등록
        handlers[currentItem.method] = new jayson.Method({
            handler: currentHandler,
            collect: true,
            params: Array
        });
    
        console.log(`메소드 ${currentItem.method}가 핸들러로 추가됨`);
    }
    
    // jayson 서버 객체 생성
    const jaysonServer = jayson.server(handlers);
    
    // app의 패스로 라우팅
    console.log(`패스 [${apiPath}]에서 RPC 호출을 라우팅하도록 설정됨`);
    
    app.post(apiPath, function(req, res, next) {
        console.log(`패스 [${apiPath}]에서 JSON-RPC로 호출됨`);
        
        const options = {};
        
        // Content-Type이 application/json이 아니면 415 unsupported media type error
        const contentType = req.headers['content-type'] || '';
        if (!RegExp('application/json', 'i').test(contentType)) {
            console.log(`application/json 타입이 아님`);
            return error(415);
        }
        
        // body 부분의 데이터가 없는 경우, 500 server error
        if (!req.body || typeof(req.body) !== 'object') {
            console.log(`요청 body가 비정상임`);
            return error(400, 'Request body must be parsed');
        }
        
        // RPC 함수 호출
        console.log(`RPC 함수를 호출합니다`);
        jaysonServer.call(req.body, (error, success) => {
            const response = error || success;
    
            console.log(response);
            
            // 결과 데이터를 JSON으로 만들어 응답
            utils.JSON.stringify(response, options, (error, body) => {
                if (error) {
                    return error;
                }
                
                if (body) {
                    const headers = {
                        'Content-Length': Buffer.byteLength(body, 'utf-8'),
                        'Content-Type': 'application/json'
                    };
                    
                    res.writeHead(200, headers);
                    res.write(body);
                } else {
                    res.writeHead(204);
                }
                
                res.end();
            });
        });
        
        // 에러 응답
        function error(code, headers) {
            res.writeHead(code, headers | {});
            res.end();
        }
    });
    
    return handlers;
}

module.exports = handlerLoader;
