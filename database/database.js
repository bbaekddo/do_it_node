const mongoose = require('mongoose');

// 데이터베이스 객체 생성
const database = {};
database.init = function(app, config) {
    console.log('데이터 베이스에 연결을 시도합니다');
    
    // setting의 db url 불러오기
    const databaseURL = config.dbURL;
    // mongoose로 데이터베이스 객체 생성
    mongoose.Promise = global.Promise;
    mongoose.connect(databaseURL);
    database.db = mongoose.connection;
    
    // 데이터베이스 연결
    database.db.on('error', console.error.bind(console, 'mongoose connection error'));
    database.db.on('open', () => {
        console.log('데이터 베이스에 연결되었습니다');
        
        createSchema(app, config);
    });
    
    // 연결이 끊어졌을 때 5초후 재연결
    database.db.on('disconnected', () => {
        console.log('연결이 끊어졌습니다. 5초 후 재연결합니다');
        setInterval(database.init, 5000);
    });
}

// setting에 정의한 스키마 및 모델 객체 생성
function createSchema(app, config) {
    const schemaLength = config.dbSchemas.length;
    console.log(`설정된 스키마 개수 : ${schemaLength}`);
    
    for (let i = 0; i < schemaLength; i++) {
        const currentItem = config.dbSchemas[i];
        
        // setting 파일에서 스키마 모듈 불러오기
        const currentUserSchema = require(currentItem.file);
        const currentSchema = currentUserSchema.createCustomSchema(mongoose);
        
        // User 모델 정의
        const currentModel = mongoose.model(currentItem.collection, currentSchema);
        
        // database 객체에 속성으로 추가
        database[currentItem.schemaName] = currentSchema;
        database[currentItem.modelName] = currentModel;
        console.log(`스키마 이름 : ${currentItem.schemaName}, 모델 이름 : ${currentItem.modelName}`);
    }
    
    // 데이터베이스 객체를 app의 속성으로 추가
    app.set('database', database);
}

module.exports = database;