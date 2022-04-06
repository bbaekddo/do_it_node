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

// 데이터베이스 스키마 객체를 위한 변수 선언
let userSchema;

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
    
        // 스키마 정의
        userSchema = mongoose.Schema({
            id: { type: String, required: true, unique: true },
            name: { type: String, index: 'hashed' },
            password: { type: String, required: true },
            age: { type: Number, 'default': -1 },
            createdAt: { type: Date, index: { unique: false }, 'default': Date.now},
            updatedAt: { type: Date, index: { unique: false }, 'default': Date.now}
        });
        // 스키마에 static 메소드 추가
        userSchema.static('findById', function(id, callback) {
            return this.find({ id }, callback);
        });
        userSchema.static('findAll', function(callback) {
            return this.find({ }, callback);
        });
        console.log('스미카 정의 완료');
    
        // 모델 정의
        userModel = mongoose.model('users2', userSchema);
        console.log('모델 정의 완료');
    });
    
    // 연결이 끊어졌을 때 5초후 재연결
    database.on('disconnected', () => {
        console.log('연결이 끊어졌습니다. 5초 후 재연결합니다');
        setInterval(connectDB, 5000);
    });
}

// 사용자 인증
const authUser = function(database, id, password, callback) {
    console.log('authUser call');
    
    // 아이디와 비밀번호로 사용자 검색
    userModel.findById(id, function(err, result) {
        if (err) {
            callback(err, null);
        }
    
        console.log(`아이디 : ${id} 비밀번호 : ${password}로 조회`);
        console.dir(result);
        
        if (result.length > 0) {
            console.log('사용자 아이디 검색 완료');
            
            if (result[0]._doc.password === password) {
                console.log('사용자 비밀번호 검색 완료');
                callback(null, result);
            } else {
                console.log('사용자 비밀번호 틀림');
                callback(null, null);
            }
        } else {
            console.log('사용자 검색 불가');
            callback(null, null);
        }
    });
};

// 사용자 전체 조회
app.post('/process/userlist',(req, res) => {
    console.log('/process/userlist call');
    
    // 데이터 베이스 객체가 초기화된 경우, 모델 객체의 findAll 메소드 호출
    if (database) {
        // 1. 모든 사용자 검색
        userModel.findAll((err, result) => {
            // 에러 발생 시 클라이언트로 에러 응답 전송
            if (err) {
                console.log(`사용자 전체 조회 중 에러 발생 : ${err.stack}`);
                
                res.writeHead('200', { "Content-Type": "text/html;charset=utf8"});
                res.write(`<h2>사용자 전체 조회 중 에러 발생</h2>`);
                res.write(`<p>${err.stack}</p>`);
                res.end();
            }
            
            // 결과 있으면 목록을 응답 전송
            if (result) {
                console.dir(result);
    
                res.writeHead('200', { "Content-Type": "text/html;charset=utf8"});
                res.write(`<h2>사용자 전체 목록</h2>`);
                res.write(`<div><ul>`);
                
                for (let i = 0; i < result.length; i++) {
                    const curId = result[i]._doc.id;
                    const curName = result[i]._doc.name;
                    res.write(`    <li>#${i} : ${curId}, ${curName}</li>`);
                }
    
                res.write(`</ul></div>`);
                res.end();
            // 결과 객체 없으면 응답 전송
            } else {
                res.writeHead('200', { "Content-Type": "text/html;charset=utf8"});
                res.write(`<h2>사용자 전체 조회 실패</h2>`);
                res.end();
            }
        });
    }
})



// 라우터 객체 참조
const router = express.Router();

// 로그인 라우팅 함수 - 데이터베이스 정보와 비교
app.post('/process/login', function(req, res) {
    console.log('/process/login call');
    
    const paramId = req.body.id || req.query.id;
    const paramPassword = req.body.password || req.query.password;
    
    if (database) {
        authUser(database, paramId, paramPassword, function(err, docs) {
            if (err) throw err;
            
            if (docs) {
                console.dir(docs);
                const userName = docs[0].name;
                res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8'});
                res.write(`<h1>로그인 성공</h1>`);
                res.write(`<div><p>사용자 아이디 : ` + paramId + `</p></div>`);
                res.write(`<div><p>사용자 이름 : ` + userName + `</p></div>`);
                res.write(`<br><br><a href="/public/login.html">다시 로그인하기</a>`);
                res.end();
            } else {
                res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8'});
                res.write(`<h1>로그인 실패</h1>`);
                res.write(`<div><p>아이디와 비밀번호를 다시 확인하십시오</p></div>`);
                res.write(`<br><br><a href="/public/login.html">다시 로그인하기</a>`);
                res.end();
            }
        });
    } else {
        res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8'});
        res.write(`<h1>데이터베이스 연결 실패</h1>`);
        res.write(`<div><p>데이터베이스를 찾지 못했습니다</p></div>`);
        res.end();
    }
});

// 사용자 추가
const addUser = function(database, id, name, password, callback) {
    console.log('addUser call');
    
    const newUser = new userModel({
        "id": id,
        "name": name,
        "password": password
    });
    
    newUser.save((err) => {
        if (err) {
            callback(err, null);
        }
    
        console.log('사용자 추가 완료');
        callback(null, newUser);
    });
};

// 사용자 추가 라우팅
router.route('/process/adduser').post((req, res) => {
    console.log('/process/adduser call');
    
    const paramId = req.body.id || req.query.id;
    const paramName = req.body.name || req.query.name;
    const paramPassword = req.body.password || req.query.password;
    
    console.log('사용자 추가 요청 파라미터 : ' + paramId +', ' + paramName + ', ' + paramPassword);
    
    // 데이터베이스 객체가 초기화된 경우, addUser 함수 호출하여 사용자 추가
    if (database) {
        addUser(database, paramId, paramName, paramPassword, (err, result) => {
            if (err) throw err;
    
            // 결과 객체 확인하여 추가된 데이터가 있으면 성공 응답 전송
            if (result.insertedId !== null) {
                console.dir(result);
                
                res.writeHead('200', { "Content-Type": "text/html;charset=utf8"});
                res.write(`<h2>사용자 추가 성공</h2>`);
                res.end();
            } else {
                res.writeHead('200', { "Content-Type": "text/html;charset=utf8"});
                res.write(`<h2>사용자 추가 실패</h2>`);
                res.end();
            }
        });
        // 데이터 베이스 객체과 초기화 되지 않은 경우
    } else {
        res.writeHead('200', { "Content-Type": "text/html;charset=utf8"});
        res.write(`<h2>데이터 베이스 연결 실패</h2>`);
        res.end();
    }
});


// 라우터 객체 등록
app.use('/', router);

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