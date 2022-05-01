const LocalStrategy = require('passport-local').Strategy;

const localSignUp = new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
    // 요청 파라미터 중 name 파라미터 확인
    const paramName = req.body.name || req.query.name;
    console.log(`passport의 localSignUp 호출 : ${email}, ${password}, ${paramName}`);
    
    // user.findOne이 blocking되므로 async 방식으로 변경
    process.nextTick(() => {
        const database = req.app.get('database');
        database.userModel.findOne({'email': email}, (err, user) => {
            if (err) {
                return done(err);
            }
            
            // 기존에 이메일이 있으면 에러
            if (user) {
                console.log('등록된 이메일이 있음');
                
                return done(null, false, req.flash('signUpMessage', '중복된 이메일입니다'));
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
});

module.exports = localSignUp;