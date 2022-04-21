const mongoose = require('mongoose');

// database 객체에 db, schema, model 추가
const database = {};
database.init = function(app, config) {
    console.log('database initializing...');
    
    connect(app, config);
}

// 데이터베이스에 연결하고 응답 객체의 속성으로 db 객체 추가
function connect(app, config) {
    console.log('connect function call...');
    
    const databaseURL = config.dbURL;
    
    console.log('데이터 베이스 연결을 시도합니다');
    
    // 데이터베이스 연결
    mongoose.Promise = global.Promise;
    mongoose.connect(databaseURL);
    const db = mongoose.connection;
    
    db.on('error', console.error.bind(console, 'mongoose connection error'));
    db.on('open', () => {
        console.log('데이터 베이스에 연결되었습니다');
        
        createSchema(app, config);
    });
    
    // 연결이 끊어졌을 때 5초후 재연결
    db.on('disconnected', () => {
        console.log('연결이 끊어졌습니다. 5초 후 재연결합니다');
        setInterval(connect, 5000);
    });
}

// config에 정의한 스키마 및 모델 객체 생성
function createSchema(app, config) {
    const schemaLength = config.dbSchemas.length;
    console.log(`설정된 스키마 개수 : ${schemaLength}`);
    
    for (let i = 0; i < schemaLength; i++) {
        const currentItem = config.dbSchemas[i];
        
        // 모듈 파일에서 모듈을 불러온 후 createSchema 함수 호출
        const currentSchema = require(currentItem.file).schema.createSchema(mongoose);
        console.log(`${currentItem.file} 모듈 로딩 후 스키마 정의`);
        
        // User 모델 정의
        const currentModel = mongoose.model(currentItem.collection, currentSchema);
        console.log(`${currentItem.collection} 컬렉션을 위해 모델 정의`);
        
        // database 객체에 속성으로 추가
        database[currentItem.schemaName] = currentSchema;
        database[currentItem.modelName] = currentModel;
        console.log(`스키마 이름 : ${currentItem.schemaName}, 모델 이름 : ${currentItem.modelName}`);
    }
    
    app.set('database', database);
    console.log(`데이터베이스 객체가 app 객체의 속성으로 추가됨`);
}

// database 객체를 module.exports에 할당
module.exports = database;