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

// JSON-RPC 모듈 사용
const handlerLoader = require('./handler/handlerLoader');
const jayson = require('jayson');

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

// JSON-RPC 핸들러 정보를 읽어들여 핸들러 경로 설정
const jsonRPC_APIPath = config.jsonrpc_api_path || '/api';
handlerLoader.init(jayson, app, jsonRPC_APIPath);
console.log(`JSON-RPC를 [${jsonRPC_APIPath}] 패스에서 사용하도록 설정함`);

// 404 page error (마지막에 사용 유의!!)
app.use(expressErrorHandler.httpError(404, 'Page Not Found'));

// 서버 시작
const server = app.listen(config.port, function() {
    console.log(`Local Express Server Start... ${app.get('port')}`);
});

// socket.io 서버 시작
const io = socketio(server, { path: '/socket.io' });
console.log('socket.io 요청을 받아들일 준비가 되었습니다');

// 로그인 아이디 매핑(로그인 id -> 소켓 id)
const loginIds = {};

// 클라이언트가 연결했을 때 이벤트 처리
io.sockets.on('connection', (socket) => {
    console.log('connection info : ', socket.request.connection._peername);
    
    // 로그인 이벤트를 받았을 때
    socket.on('login', function(login) {
        console.log('login 이벤트를 받았습니다');
        console.dir(login);
        
        // 기존 클라이언트 ID가 없으면 클라이언트 ID를 맵에 추가
        console.log(`접속한 소켓의 ID : ${socket.id}`);
        loginIds[login.id] = socket.id;
        socket.loginId = login.id;
    
        console.log(`접속한 클라이언트 ID 개수 : ${Object.keys(loginIds).length}`);
        
        // 응답메세지 전송
        sendResponse(socket, 'login', '200', '로그인되었습니다');
    });
    
    // 로그아웃 이벤트를 받았을 때
    socket.on('logout', function(logout) {
        console.log('logout 이벤트를 받았습니다');
        console.dir(logout);
        
        // 기존 클라이언트 ID가 없으면 클라이언트 ID를 맵에 추가
        console.log(`접속한 소켓의 ID : ${socket.id}`);
        delete loginIds[logout.id];
        delete socket.loginId;
        
        console.log(`접속한 클라이언트 ID 개수 : ${Object.keys(loginIds).length}`);
        
        // 응답메세지 전송
        sendResponse(socket, 'logout', '200', '로그아웃 되었습니다');
    });
    
    // message 이벤트를 받았을 때
    socket.on('message', function(message) {
        console.log('message 이벤트를 받았습니다');
        console.dir(message);
        
        if (message.recepient === 'ALL') {
            // 나를 포함한 모든 클라이언트에게 메세지 전달
            console.log('나를 포함한 모든 클라이언트에게 message 이벤트를 전송합니다');
            io.sockets.emit('message', message);
        } else {
            // command 속성으로 일대일 채팅과 그룹 채팅 구별
            if (message.command === 'chat') {
                // 일대일 채팅 대상에게 메세지 전달
                if (loginIds[message.recepient]) {
                    socket.to([loginIds[message.recepient]]).emit('message', message);
        
                    // 응답 메세지 전송
                    sendResponse(socket, 'message', '200', '메세지를 전송했습니다');
                } else {
                    sendResponse(socket, 'login', '404', '상대방의 로그인 ID를 찾을 수 없습니다');
                }
            } else if (message.command === 'groupChat') {
                // 방에 들어있는 모든 사용자에게 메세지 전달
                socket.to(message.recepient).emit('message', message);
                
                // 응답 메세지 전송
                sendResponse(socket, 'message', '200', `방 [${message.recepient}]의 모든 사용자들에게 메세지를 전송했습니다`);
            }
        }
    });
    
    // room 이벤트를 받았을 때
    socket.on('room', function(room) {
        console.log('room 이벤트를 받았습니다');
        console.dir(room);
        
        if (room.command === 'create') {
            if (io.sockets.adapter.rooms.get(room.roomId)) {
                console.log('방이 이미 만들어져 있습니다');
                console.dir(io.sockets.adapter.rooms.get(room.roomId));
            } else {
                console.log('방을 새로 생성합니다');
                
                socket.join(room.roomId);
                
                let currentRoom = io.sockets.adapter.rooms.get(room.roomId);
                currentRoom.id = room.roomId;
                currentRoom.name = room.roomName;
                currentRoom.owner = room.roomOwner;
            }
        } else if (room.command === 'update') {
            let currentRoom = io.sockets.adapter.rooms.get(room.roomId);
            currentRoom.name = room.roomName;
            currentRoom.owner = room.roomOwner;
        } else if (room.command === 'delete') {
            socket.leave(room.roomId);
            
            if (io.sockets.adapter.rooms.get(room.roomId)) {
                delete io.sockets.adapter.rooms.get(room.roomId);
            } else {
                console.log('방이 만들어져 있지 않습니다');
            }
        } else if (room.command === 'join') {
            socket.join(room.roomId);
            
            // 응답 메세지 전송
            sendResponse(socket, 'room', '200', '방에 입장했습니다');
        } else if (room.command === 'leave') {
            socket.leave(room.roomId);
            
            // 응답 메세지 전송
            sendResponse(socket, 'room', '200', '방에서 나갔습니다');
        } else {
            alert('room command error!');
        }
        
        const roomList = getRoomList();
        
        const output = {
            rooms: roomList,
            command: 'list'
        };
        console.log(`클라이언트로 보낼 데이터 : ${JSON.stringify(output)}`);
        
        io.sockets.emit('room', output);
    })
    
    // 응답 메세지 전송 메소드
    function sendResponse(socket, command, code, message) {
        const statusObj = {
            command: command,
            code: code,
            message: message
        };
        
        socket.emit('response', statusObj);
    }
    
    // 사용자가 추가한 방 조회
    function getRoomList() {
        const roomList = [];
    
        // room ID와 socket ID가 다른 Map 객체 찾기
        for (let [key, value] of io.sockets.adapter.rooms) {
            const outRoom = Array.from(value);
    
            let foundDefault = false;
            let index = 0;
            outRoom.forEach((setValues) => {
                if (key === setValues) {
                    foundDefault = true;
                }
                index++;
            });
            
            if (!foundDefault) {
                roomList.push(io.sockets.adapter.rooms.get(key));
            }
        }
        
        console.log('[ROOM LIST]');
        console.dir(roomList);
        
        return roomList;
    }
    
    // 소켓 객체에 클라이언트 Host, Port 정보를 속성으로 추가
    socket.remoteAddress = socket.request.connection._peername.address;
    socket.remotePort = socket.request.connection._peername.port;
});
