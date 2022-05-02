// Express 기본 모듈 사용
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

// socket.io 모듈 사용
const socketio = require('socket.io');

// cors 모듈 사용
const cors = require('cors');

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

// cors 사용
app.use(cors());

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
const server = app.listen(config.port, function() {
    console.log(`Local Express Server Start... ${app.get('port')}`);
});

// socket.io 서버 시작
const io = socketio(server, { path: '/socket.io' });
console.log('socket.io 요청을 받아들일 준비가 되었습니다');

// 클라이언트가 연결했을 때 이벤트 처리
io.sockets.on('connection', (socket) => {
    console.log('connection info : ', socket.request.connection._peername);
    
    // message 이벤트를 받았을 때
    socket.on('message', (message) => {
        console.log('message 이벤트를 받았습니다');
        console.dir(message);
        
        if (message.recepient === 'ALL') {
            // 나를 포함한 모든 클라이언트에게 메세지 전달
            console.dir('나를 포함한 모든 클라이언트에게 message 이벤트를 전송합니다');
            io.sockets.emit('message', message);
        }
    })
    
    // 소켓 객체에 클라이언트 Host, Port 정보를 속성으로 추가
    socket.remoteAddress = socket.request.connection._peername.address;
    socket.remotePort = socket.request.connection._peername.port;
});