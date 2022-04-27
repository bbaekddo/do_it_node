// Express 기본 모듈 불러오기
const express = require('express');
const path = require('path');

// Express 미들웨어 불러오기
const bodyParser = require('body-parser');
const serveStatic = require('serve-static');

// 에러 핸들러 모듈 사용
const expressErrorHandler = require('express-error-handler');

// config 파일 불러오기
const config = require('./config/setting');

// 데이터베이스 설정 파일 불러오기
const database = require('./database/database');

// passport 사용
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');

// 라우터 객체 생성
const router = express.Router();
const routeLoader = require('./routes/routeLoader');

// -------------- //

// Express 객체 생성
const app = express();

// Express 기본 속성 설정
app.set('port', process.env.PORT || config.port);
app.set('views', `${__dirname}/views`);
app.set('view engine', 'pug');

// passport 초기화
app.use(passport.initialize);
app.use(passport.session);
app.use(flash);

// body-parser를 사용해 url 파싱
app.use(bodyParser.urlencoded({ extended: false }));

// body-parserf를 사용해 json 파싱
app.use(bodyParser.json());

// public 폴더를 static으로 오픈
app.use('/public', serveStatic(path.join(__dirname, 'public')));

// 404 page error
app.use(expressErrorHandler.httpError(404, 'Page Not Found'));

// passport 로그인 설정
passport.use('localLogin', new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
    console.log(`passport의 local-login 호출됨 : ${email}, ${password}`);
    
    const database = app.get('database');
    database.userModel.findOne({'email': email}, (err, user) => {
        if (err) {
            return done(err);
        }
        
        // 등록된 사용자가 없는 경우
        if (!user) {
            console.log('계정이 일치하지 않음');
            
            return done(null, false, req.flash('loginMessage', '등록된 계정이 없습니다'));
        }
        
        // 비밀번호가 일치하지 않는 경우
        const authenticated = user.authenticate(password, user._doc.salt, user._doc.hashedPassword);
        
        if (!authenticated) {
            console.log('비밀번호가 일치하지 않음');
            
            return done(null, false, req.flash('loginMessage', '비밀번호가 일치하지 않습니다'));
        }
        
        // 정상적으로 확인된 경우
        console.log('사용자 정보 검색 완료');
        
        return done(null, user);
    });
}));

// passport 회원가입 설정
passport.use('localSignUp', new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
    // 요청 파라미터 중 name 파라미터 확인
    const paramName = req.body.name || req.query.name;
    console.log(`passport의 localSignUp 호출 : ${email}, ${password}, ${paramName}`);
    
    // user.findOne이 blocking되므로 async 방식으로 변경
    process.nextTick(() => {
        const database = app.get('database');
        database.userModel.findOne({'email': email}, (err, user) => {
            if (err) {
                return done(err);
            }
            
            // 기존에 이메일이 있으면 에러
            if (user) {
                console.log('등록된 이메일이 있음');
                
                return done(null, false, req.flash('signupMessage', '중복된 이메일입니다'));
            } else {
                // 모델 인스턴스 객체를 만들어 저장
                const user = new database.userModel({'email': email, 'password': password, 'name': paramName});
                user.save((err) => {
                    if (err) {
                        throw err;
                    }
    
                    console.log('사용자 데이터 추가 완료');
                    
                    return done(null, user);
                });
            }
        });
    });
}));

// 사용자 인증에 성공했을 때
passport.serializeUser((user, done) => {
    console.log('serializeUser Call...');
    console.dir(user);
    
    done(null, user);
});

// 사용자 인증 이후 사용자 요청이 있을 때마다 호출
passport.deserializeUser((user, done) => {
    console.log('DeserializeUser Call...');
    console.dir(user);
    
    done(null, user);
})

// 데이터베이스 시작
database.init(app, config);

// 라우팅 시작
routeLoader.init(app, router);

/*
// 404 오류 페이지 설정
const errorHandler = expressErrorHandler({
    static: {
        '404': './public/404.html'
    }
});
app.use(errorHandler);
*/

// 서버 시작
app.listen(config.port, function() {
    console.log(`Local Express Server Start... ${app.get('port')}`);
});