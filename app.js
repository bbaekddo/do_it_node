// Express 기본 모듈 불러오기
const express = require('express');
const path = require('path');

// Express 미들웨어 불러오기
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const serveStatic = require('serve-static');
// const errorHandler = require('errorhandler');

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



// mongoDB 모듈 사용
const mongoClient = require('mongodb').MongoClient;

// 데이터베이스 객체를 위한 변수 선언
let database;

// 데이터베이스에 연결
function connectDB() {
    // 데이터베이스 연결 정보
    const databaseURL = 'mongodb://127.0.0.1:27017/local';
    
    // 데이터베이스 연결
    mongoClient.connect(databaseURL, function(err, db) {
        if (err) throw err;
    
        console.log('데이터베이스에 연결되었습니다 : ' + databaseURL);
        
        // database 변수에 할당
        database = db.db('local');
    });
}

const authUser = function(database, id, password, callback) {
    console.log('authUser call');
    
    // users 컬렉션 참조
    const users = database.collection('users');
    
    // 아이디와 비밀번호로 검색
    users.find({
        "id": id,
        "password": password
    }).toArray(function(err, docs) {
        if (err) {
            callback(err, null);
        }
        
        if (docs.length > 0) {
            console.log(`아이디 [${id}], 비밀번호 [${password}]가 일치하는 사용자 찾음`);
            callback(null,docs);
        } else {
            console.log('일치하는 사용자를 찾지 못함');
            callback(null, null);
        }
    });
}



// 라우터 객체 참조
const router = express.Router();

// 로그인 라우팅 함수 - 데이터베이스 정보와 비교
app.post('/process/login', function(req, res) {
    console.log('/process/login call');
    
    const paramId = req.body.id;
    const paramPassword = req.body.password;
    
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