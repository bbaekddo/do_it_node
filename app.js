// Express 기본 모듈 불러오기
const express = require('express');
const path = require('path');

// Express 미들웨어 불러오기
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const serveStatic = require('serve-static');

// 에러 핸들러 모듈 사용
const expressErrorHandler = require('express-error-handler');

// Session 미들웨어 불러오기
const session = require('express-session');

// Express 객체 생성
const app = express();

// Route 객체 생성
const userRoute = require('./routes/userRoute');

// config 파일 불러오기
const config = require('./config/setting');

// 데이터베이스 설정 파일 불러오기
const database = require('./database/database');

// 기본 속성 설정
app.set('port', process.env.PORT || config.port);

// 데이터베이스 시작
database.init(app, config);

// 뷰 엔진 설정
app.set('views', `${__dirname}/views`);
app.set('view engine', 'pug');

// body-parser를 사용해 url 파싱
app.use(bodyParser.urlencoded({ extended: false }));

// body-parserf를 사용해 json 파싱
app.use(bodyParser.json());

// public 폴더를 static으로 오픈
app.use('/public', serveStatic(path.join(__dirname, 'public')));

// cookie-parser 설정
app.use(cookieParser());

// 세션 설정
app.use(session({
    secret: 'myKey',
    resave: true,
    saveUninitialized: true
}));

// 라우터 객체 생성
const router = express.Router();
const routeLoader = require('./routes/routeLoader');

// 라우팅 시작
routeLoader.init(app, router);

// 404 오류 페이지 설정
const errorHandler = expressErrorHandler({
    static: {
        '404': './public/404.html'
    }
});

app.use(expressErrorHandler.httpError(404, 'Page Not Found'));
app.use(errorHandler);


// 서버 시작
app.listen(config.port, function() {
    console.log(`Local Express Server Start... ${app.get('port')}`);
});