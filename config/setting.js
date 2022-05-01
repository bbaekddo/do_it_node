// setting 객체 생성
const setting = {};

setting.port = 3000;
setting.dbURL = 'mongodb://localhost:27017/local';
setting.dbSchemas = [
    {
        file: `${__dirname}/../database/userSchema`,
        collection: 'users5',
        schemaName: 'userSchema',
        modelName: 'userModel'
    }
];
setting.routeInfo = [
];
setting.facebook = {
    clientID: '420065332493079',
    clientSecret: 'a222b4bef624e1b918018e879cb1b1f6',
    callbackURL: '/auth/facebook/callback'
}

module.exports = setting;