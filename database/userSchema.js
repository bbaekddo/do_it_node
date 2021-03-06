// crypto 모듈 불러오기
const crypto = require('crypto');

// 스키마 객체 생성
const schema = {};

// 데이터베이스 스키마 객체를 위한 변수 선언
schema.createCustomSchema = function(mongoose) {
    /*
    * 스키마 정의
    * password를 hashedPassword로 변경
    * default 속성 추가
    * salt 속성 추가
    */
    const userSchema = mongoose.Schema({
        email: { type: String, 'default': '' },
        hashedPassword: { type: String, 'default': '' },
        name: { type: String, index: 'hashed', 'default': '' },
        salt: { type: String },
        provider: { type: String, 'default': '' },
        authToken: { type: String, 'default': '' },
        facebook: { },
        createdAt: { type: Date, index: { unique: false }, 'default': Date.now },
        updatedAt: { type: Date, index: { unique: false }, 'default': Date.now }
    });
   
    // password를 virtual 메소드로 정의
    userSchema
        .virtual('password')
        .set(function(password) {
            this._password = password;
            this.salt = this.makeSalt();
            this.hashedPassword = this.encryptPassword(this._password, this.salt);
            console.log(`virtual password call : ${this.hashedPassword}`);
        })
        .get(function() {
            return this._password;
        });
    
    // 스키마에 모델 인스턴스에서 사용할 수 있는 메소드 추가
    // 비밀번호 암호화 메소드
    userSchema.method('encryptPassword', function(plainText, inSalt) {
        if (inSalt) {
            return crypto.createHmac('sha1', inSalt).update(plainText).digest('hex');
        } else {
            return crypto.createHmac('sha1', this.salt).update(plainText).digest('hex');
        }
    });
    
    // salt 생성 메소드
    userSchema.method('makeSalt', () => {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    });
    
    // 인증 메소드 (입력된 비밀번호와 비교)
    userSchema.method('authenticate', function(plainText, inSalt, hashedPassword) {
        if (inSalt) {
            console.log(`authenticate call : ${plainText} -> ${this.encryptPassword(plainText, inSalt)} : ${this.hashedPassword}`);
            return this.encryptPassword(plainText, inSalt) === hashedPassword;
        } else {
            console.log(`authenticate call : ${plainText} -> ${this.encryptPassword(plainText)} : ${this.hashedPassword}`);
            return this.encryptPassword(plainText) === hashedPassword;
        }
    });
    
    // 스키마에 static 메소드 추가
    userSchema.static('findByEmail', function(email, callback) {
        return this.find({ email: email }, callback);
    });
    userSchema.static('findAll', function(callback) {
        return this.find({ }, callback);
    });
    
    console.log('User 스키마 생성 완료');

    return userSchema;
};

module.exports = schema;