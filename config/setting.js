// setting 객체 생성
const setting = {};

setting.port = 3000;
setting.dbURL = 'mongodb://localhost:27017/local';
setting.dbSchemas = [
    {
        file: `${__dirname}/../database/userSchema`,
        collection: 'users3',
        schemaName: 'userSchema',
        modelName: 'userModel'
    }
];

module.exports = setting;

/*
module.exports = {
    port: 3000,
    db_url: 'mongodb://localhost:27017/local',
    db_schemas: [
        {
            file: '/Users/dohyeonsmac/Desktop/Programming/do_it_node/config/userSchema',
            collection: 'users3',
            schemaName: 'userSchema',
            modelName: 'userModel'
        }
    ]
}
*/