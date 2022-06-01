const listUser = (req, res) => {
    console.log(`user 모듈 안에 있는 listUser 호출됨`);
    
    // 데이터베이스 객체 참조
    const globalDB = req.app.get('database');
    
    // 데이터베이스 객체가 초기화 된 경우
    if (globalDB.db) {
        globalDB.userModel.findAll((error, results) => {
            if (error) {
                console.error(`사용자 리스트 조회 중 오류 발생 : ${error.stack}`);
                
                res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8' });
                res.write(`<h2>사용자 리스트 조회 중 오류 발생</h2>`);
                res.write(`</p>${error.stack}</p>`);
                res.end();
            }
            
            if (results) {
                console.dir(results);
                
                res.writeHead('200', { 'Content-Type': 'application/json; charset=utf8' });
                res.write(JSON.stringify(results));
                res.end();
            } else {
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 리스트 조회  실패</h2>');
                res.end();
            }
        });
    } else {
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }
};

module.exports = {
    listUser
};