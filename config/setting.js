// setting 객체 생성
const setting = {};

setting.port = 3000;
setting.dbURL = 'mongodb://localhost:27017/local';
setting.dbSchemas = [
    {
        file: `${__dirname}/../database/userSchema`,
        collection: 'users6',
        schemaName: 'userSchema',
        modelName: 'userModel'
    },
    {
        file: `${__dirname}/../database/cafeSchema`,
        collection: 'cafe',
        schemaName: 'cafeSchema',
        modelName: 'cafeModel'
    }
];
setting.routeInfo = [
    { file: `${__dirname}/../routes/cafe`, path: '/process/addCafe', method: 'add', type: 'post' },
    { file: `${__dirname}/../routes/cafe`, path: '/process/listCafe', method: 'list', type: 'post' }
];
setting.facebook = {
    clientID: 'id',
    clientSecret: 'secret',
    callbackURL: '/auth/facebook/callback'
}

setting.jsonrpc_api_path = '/api';

module.exports = setting;