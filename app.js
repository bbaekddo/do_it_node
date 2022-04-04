const express = require('express')
    , http = require('http')
    , path = require('path');
const bodyParser = require('body-parser')
    , cookieParser = require('cookie-parser')
    , serveStatic = require('serve-static')
    , errorHandler = require('errorhandler');
const expressErrorHandler = require('express-error-handler');
const expressSession = require('express-session');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');

const app = express();

app.set('port', process.env.PORT || 3000);

// body-parser를 사용해 파싱
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

// public 폴더와 uploads 폴더 오픈
app.use('/public', serveStatic(path.join(__dirname, 'public')));
app.use('/uploads', serveStatic(path.join(__dirname, 'uploads')));

// cookie-parser 설정
app.use(cookieParser);

// 세션 설정
app.use(expressSession({
    secret: 'my-key',
    resave: true,
    saveUninitialized: true
}));

// 클라이언트에서 ajax로 요청했을 때 CORS(다중 서버 접속) 지원
app.use(cors());

// multer 미들웨어 사용 : 순서 중요! body-parser => multer => router
// 파일 제한 : 10개, 1MB
const storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, 'uploads');
    },
    filename: function(req, file, callback) {
        callback(null, file.originalname + Date.now());
    }
});

const upload = multer({
    storage: storage,
    limits: {
        files: 10,
        fileSize: 1024 * 1024 * 1024
    }
});

const router = express.Router();

router.route('/process/photo').post(upload.array('photo', 1), function(req, res) {
    console.log('/process/photo 호출');
    
    try {
        const files = req.files;
        
        console.dir('#=======업로드 첫 번째 파일 정보=======#');
        console.dir(req.files[0]);
        console.dir('#======#');
    
        let originalname = '',
            filename = '',
            mimetype = '',
            size = 0;
        
        if (Array.isArray(files)) {
            console.log('배열에 들어있는 파일 개수 : ', files.length);
            
            for (let i=0; i<files.length; i++) {
                originalname = files[i].originalname;
                filename = files[i].filename;
                mimetype = files[i].mimetype;
                size = files[i].size;
            }
        } else {
            console.log('파일 개수 : 1');
            
            originalname = files[0].originalname;
            filename = files[0].name;
            mimetype = files[0].mimetype;
            size = files[0].size;
        }
    
        console.log('현재 파일 정보 : ' + originalname + ', ' + filename + ', '
                    + mimetype + ', ' + size);
        
        res.writeHead('200', {"Content-Type": "text/html;charset=utf8"});
        res.write('<h3>파일 업로드 성공</h3>');
        res.write('<hr/>');
        res.write('<p>원본 파일 이름 : ' + originalname + ' -> 저장 파일명 : '
                  + filename + '</p>');
        res.write('<p>MIME TYPE : ' + mimetype + '</p>');
        res.write('<p>파일 크기 : ' + size + '</p>');
        res.end();
    } catch (err) {
        console.dir(err.stack);
    }
});

app.use('/', router);

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express 서버 시작 : ', app.get('port'));
});