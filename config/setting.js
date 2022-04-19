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