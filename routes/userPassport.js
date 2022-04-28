module.exports = (router, passport) => {
    console.log('userPassport Call...');
    
    // 홈 화면 라우팅
    router.get('/', (req, res) => {
        console.log('/ 패스 요청됨');
        
        res.render('index.ejs');
    });

// 로그인 요청 화면
    router.route('/login')
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
    router.route('/signUp')
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
    router.get('/profile', (req, res) => {
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
    router.get('/logout', (req, res) => {
        console.log('/logout 패스 요청됨');
        req.logout();
        res.redirect('/');
    });
}