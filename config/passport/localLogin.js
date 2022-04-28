const LocalStrategy = require('passport-local').Strategy;

const localLogin = new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
    console.log(`passport의 local-login 호출됨 : ${email}, ${password}`);
    
    const database = req.app.get('database');
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
});

module.exports = localLogin;