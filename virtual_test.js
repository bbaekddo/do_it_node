const mongodb = require('mongodb');
const mongoose = require('mongoose');

// 데이터 베이스, 스키마, 모델 변수 선언
let database;
let userSchema;
let userModel;

// 데이터 베이스에 연결하고 응답 객체의 속성으로 db 객체 추가
function connectDB() {
    // 데이터 베이스 연결 정보
    const databaseURL = 'mongodb://127.0.0.1:27017/local';
    
    // 데이터 베이스 연결
    mongoose.connect(databaseURL);
    database = mongoose.connection;
    
    database.on('error', console.error.bind(console, 'mongoose connection error'));
    database.on('open', () => {
        console.log('데이터 베이스에 연결되었습니다');
        
        // 스키마 및 모델 객체 생성
        createUserSchema();
        
        doTest();
    });
    database.on('disconnected', connectDB);
}

function createUserSchema() {
    /*
    * 스키마 정의
    * password를 hashed_password로 변경
    * default 속성 모두 축
    * salt 속성 추가
    */
    userSchema = mongoose.Schema({
        id: { type: String, required: true, unique: true },
        name: { type: String, index: 'hashed', 'default': ''},
        age: { type: Number, 'default': -1 },
        createdAt: { type: Date, index: { unique: false }, 'default': Date.now },
        updatedAt: { type: Date, index: { unique: false }, 'default': Date.now }
    });
    
    // info를 virtual 메소드로 정의
    userSchema
        .virtual('info')
        .set(function(info) {
            const splitted = info.split(' ');
            this.id = splitted[0];
            this.name = splitted[1];
            console.log(`virtual info 설정 완료 : ${this.id}, ${this.name}`);
        })
        .get(function() {
            return this.id + ' ' + this.name;
        });
    console.log('스키마 정의 완료');
    
    userModel = mongoose.model('users3', userSchema);
    console.log('모델 정의 완료');
}

function doTest() {
    // 모델 인스턴스 생성
    // id, name 속성은 할당하지 않고, info 속성만 할당
    const user = new userModel({ "info": "test01 소녀시대"});
    
    // save
    user.save((err) => {
        if (err) throw err;
    
        console.log('사용자 추가 완료');
        
        findAll();
    });
    
    console.log('info 속성에 값 할당 완료');
    console.log(`id : ${user.id}, name : ${user.name}`);
}

function findAll() {
    userModel.find({}, (err, result) => {
        if (err) throw err;
        
        if (result) {
            console.log(`조회된 user 문서 객체 -> id : ${result[0]._doc.id}, name : ${result[0]._doc.name}`);
        }
    });
}

connectDB();