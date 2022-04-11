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

// 기본 속성 설정
app.set('port', process.env.PORT || 3000);

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

// mongoose 모듈 불러오기
const mongoose = require('mongoose');

// 데이터베이스 객체를 위한 변수 선언
let database;

// 데이터베이스 모델 객체를 위한 변수 선언
let userModel;

// 데이터베이스에 연결
function connectDB() {
    // 데이터베이스 연결 정보
    const databaseURL = 'mongodb://127.0.0.1:27017/local';
    
    console.log('데이터 베이스 연결을 시도합니다');
    
    // 데이터베이스 연결
    mongoose.Promise = global.Promise;
    mongoose.connect(databaseURL);
    database = mongoose.connection;
    
    database.on('error', console.error.bind(console, 'mongoose connection error'));
    database.on('open', () => {
        console.log('데이터 베이스에 연결되었습니다');
    
        createUserSchema();
    });
    
    // 연결이 끊어졌을 때 5초후 재연결
    database.on('disconnected', () => {
        console.log('연결이 끊어졌습니다. 5초 후 재연결합니다');
        setInterval(connectDB, 5000);
    });
}

function createUserSchema() {
    // userSchema 모듈 불러오기
    const userSchema = require('./database/userSchema').createSchema(mongoose);
    
    // userModel 정의
    userModel = mongoose.model('users3', userSchema);
    console.log('User Model 정의 완료');
    
    // init 호출
    userRoute.init(database, userSchema, userModel);
}

// 라우터 객체 생성
const router = express.Router();

// 라우터 객체 등록
app.use('/', router);

/*router.route('/process/addUser').post(userRoute.signUp);
router.route('/process/login').post(userRoute.login);
router.route('/process/userList').post(userRoute.userList);*/

// 404 오류 페이지 설정
const errorHandler = expressErrorHandler({
    static: {
        '404': './public/404.html'
    }
});

app.use(expressErrorHandler.httpError(404, 'Page Not Found'));
app.use(errorHandler);


// 서버 시작
const port = 3000;
app.listen(port, function() {
    console.log(`Local Express Server Start... ${app.get('port')}`);
    
    // 데이터베이스 연결
    connectDB();
});