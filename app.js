// Express 기본 모듈 불러오기
const express = require('express');
const path = require('path');

// Express 미들웨어 불러오기
const bodyParser = require('body-parser');
const serveStatic = require('serve-static');
const session = require('express-session');

// 에러 핸들러 모듈 사용
const expressErrorHandler = require('express-error-handler');

// config 파일 불러오기
const config = require('./config/setting');

// 데이터베이스 설정 파일 불러오기
const database = require('./database/database');

// passport 사용
const passport = require('passport');
const configPassport = require('./config/passportSetting');
const userPassport = require('./routes/userPassport');
const flash = require('connect-flash');

// 라우터 객체 생성
const router = express.Router();

// -------------- //

// Express 객체 생성
const app = express();

// Express 기본 속성 설정
app.set('port', process.env.PORT || config.port);
app.set('views', `${__dirname}/views`);
app.set('view engine', 'pug');

// 세선 설정
app.use(session({
    secret: 'myKey',
    resave: true,
    saveUninitialized: true
}));

// 패스포트 초기화
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// 라우터 사용
app.use('/', router);

// body-parser를 사용해 url 파싱
app.use(bodyParser.urlencoded({ extended: false }));

// body-parserf를 사용해 json 파싱
app.use(bodyParser.json());

// public 폴더를 static으로 오픈
app.use('/public', serveStatic(path.join(__dirname, 'public')));

// 데이터베이스 시작
database.init(app, config);

// Passport 설정 불러오기
configPassport.setting(app, passport);

// Passport 라우팅
userPassport(app, passport);

// 404 page error (마지막에 사용 유의!!)
app.use(expressErrorHandler.httpError(404, 'Page Not Found'));

// 서버 시작
app.listen(config.port, function() {
    console.log(`Local Express Server Start... ${app.get('port')}`);
});