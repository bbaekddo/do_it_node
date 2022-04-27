const config = require(`${__dirname}/../config/setting`);

// 라우터 객체 등록
const loader = {};

loader.init = function(app, router) {
    
    const routeInfo = config.routeInfo;
    
    // setting에 등록된 라우팅 정보 불러오기
    routeInfo.forEach((info) => {
        const routePath = info.path;
        const routeType = info.type;
        const routeFile = require(`${info.file}`);
        const routeMethod = info.method;
        
        router.route(routePath)[routeType](routeFile[routeMethod]);
        console.log(`route path : ${routePath}, route method : ${routeMethod}`);
    })
    
    // app.use('/', router);
}

module.exports = loader;