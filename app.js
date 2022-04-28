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
const localStrategy = require('passport-local').Strategy;
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

// 홈 화면 라우팅
app.get('/', (req, res) => {
    console.log('/ 패스 요청됨');
    
    res.render('index.ejs');
});

// 로그인 요청 화면
app.route('/login')
    .get((req, res) => {
        console.log('/login 패스 요청됨');
        
        res.render('login.ejs', { message: req.flash('loginMessage') });
    })
    .post(passport.authenticate('localLogin', {
        successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlash: true
    }));

// 회원가입 요청 화면
app.route('/signUp')
    .get((req, res) => {
        console.log('/signUp 패스 요청됨');
        
        res.render('signUp.ejs', { message: req.flash('signUpMessage') });
    })
    .post(passport.authenticate('localSignUp', {
        successRedirect: '/profile',
        failureRedirect: '/signUp',
        failureFlash: true
    }));

// 프로필 요청 화면
app.get('/profile', (req, res) => {
    console.log('/profile 패스 요청됨');
    
    // 인증된 경우 req.user 객체에 사용자 정보가 있으며, 인증이 안된 경우 req.user는 false
    console.log('req.user 객체의 값');
    console.dir(req.user);
    
    // 인증이 안된 경우
    if (!req.user) {
        console.log('사용자 인증이 안된 상태');
        res.redirect('/');
        return;
    }
    
    // 인증된 경우
    console.log('사용자 인증 된 상태');
    if (Array.isArray(req.user)) {
        res.render('profile.ejs', { user: req.user[0]._doc });
    } else {
        res.render('profile.ejs', { user: req.user });
    }
});

// 로그아웃 요청 화면
app.get('/logout', (req, res) => {
    console.log('/logout 패스 요청됨');
    req.logout();
    res.redirect('/');
});

// 404 page error (마지막에 사용 유의!!)
app.use(expressErrorHandler.httpError(404, 'Page Not Found'));

// 서버 시작
app.listen(config.port, function() {
    console.log(`Local Express Server Start... ${app.get('port')}`);
});