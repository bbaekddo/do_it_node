const localLogin = require('./passport/localLogin');
const localSignUp = require('./passport/localSignUp');
const facebook = require('./passport/facebook');

const setting = (app, passport) => {
    console.log('/config/passport Call...');
    
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
    });
    
    // 인증 방식 설정
    passport.use('localLogin', localLogin);
    passport.use('localSignUp', localSignUp);
    passport.use('facebook', facebook(app, passport));
};

module.exports = {
    setting
};