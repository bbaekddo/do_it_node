// setting 객체 생성
const setting = {};

setting.port = 3000;
setting.dbURL = 'mongodb://localhost:27017/local';
setting.dbSchemas = [
    {
        file: `${__dirname}/../database/userSchema`,
        collection: 'users4',
        schemaName: 'userSchema',
        modelName: 'userModel'
    }
];
setting.routeInfo = [

]

module.exports = setting;