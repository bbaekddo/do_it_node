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
    clientID: 'id',
    clientSecret: 'secret',
    callbackURL: '/auth/facebook/callback'
}

setting.jsonrpc_api_path = '/api';

module.exports = setting;