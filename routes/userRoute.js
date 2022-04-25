// 객체 설정
let database;
let userSchema;
let userModel;

function init(app) {
    console.log('Route initializing...');

    database = app.get('database');
    userSchema = database.userSchema;
    userModel = database.userModel;
}

// 1. 사용자 회원가입
function signUp(req, res) {
    console.log('회원가입 프로세스 시작');
    
    const paramId = req.body.id || req.query.id;
    const paramName = req.body.name || req.query.name;
    const paramPassword = req.body.password || req.query.password;
    
    console.log('사용자 추가 요청 파라미터 : ' + paramId +', ' + paramName + ', ' + paramPassword);
    
    // 데이터베이스 객체가 초기화된 경우, addUser 함수 호출하여 사용자 추가
    if (database) {
        addUser(database, paramId, paramName, paramPassword, (err, result) => {
            if (err) throw err;
            
            // 결과 객체 확인하여 추가된 데이터가 있으면 성공 응답 전송
            if (result.insertedId !== null) {
                console.dir(result);
                
                res.writeHead('200', { "Content-Type": "text/html;charset=utf8"});
                
                // 뷰 템플릿으로 렌더링 후 전송
                const context = { title: '사용자 추가 성공' };
                req.app.render('addUser', context, (err, html) => {
                    if (err) {
                        console.error(`뷰 렌더링 중 오류 발생 : ${err.stack}`);
                        
                        res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8'});
                        res.write(`<h2>뷰 렌더링 중 오류 발생</h2>`);
                        res.write(`<p>${err.stack}</p>`);
                        res.end();
    
                        return;
                    }
                    
                    res.end(html);
                })
                
            } else {
                res.writeHead('200', { "Content-Type": "text/html;charset=utf8"});
                res.write(`<h2>사용자 추가 실패</h2>`);
                res.end();
            }
        });
        // 데이터 베이스 객체과 초기화 되지 않은 경우
    } else {
        res.writeHead('200', { "Content-Type": "text/html;charset=utf8"});
        res.write(`<h2>데이터 베이스 연결 실패</h2>`);
        res.end();
    }
}

// 2. 로그인 라우팅 함수 - 데이터베이스 정보와 비교
function login(req, res) {
    console.log('/process/login call');
    
    const paramId = req.body.id || req.query.id;
    const paramPassword = req.body.password || req.query.password;
    
    if (database) {
        authUser(database, paramId, paramPassword, function(err, docs) {
            if (err) throw err;
            
            if (docs) {
                console.dir(docs);
                const userName = docs[0].name;
                res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8'});
                
                // 뷰 템플릿을 사용해서 렌더링 후 전송
                const context = { userId: paramId, userName: userName };
                req.app.render('loginSuccess', context, (err, html) => {
                    if (err) {
                        console.error(`뷰 렌더링 중 오류 발생 ${err.stack}`);
                        
                        res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8'});
                        res.write(`<h2>뷰 렌더링 중 오류 발생</h2>`);
                        res.write(`<p>err.stack</p>`);
                        res.end();
                        
                        return;
                    }
    
                    res.end(html);
                })
            } else {
                res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8'});
                res.write(`<h1>로그인 실패</h1>`);
                res.write(`<div><p>아이디와 비밀번호를 다시 확인하십시오</p></div>`);
                res.write(`<br><br><a href="/public/login.html">다시 로그인하기</a>`);
                res.end();
            }
        });
    } else {
        res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8'});
        res.write(`<h1>데이터베이스 연결 실패</h1>`);
        res.write(`<div><p>데이터베이스를 찾지 못했습니다</p></div>`);
        res.end();
    }
}


// 3. 사용자 전체 조회
function userList(req, res) {
    console.log('/process/userlist call');
    
    // 데이터 베이스 객체가 초기화된 경우, 모델 객체의 findAll 메소드 호출
    if (database) {
        // 1. 모든 사용자 검색
        userModel.findAll((err, result) => {
            // 에러 발생 시 클라이언트로 에러 응답 전송
            if (err) {
                console.log(`사용자 전체 조회 중 에러 발생 : ${err.stack}`);
                
                res.writeHead('200', { "Content-Type": "text/html;charset=utf8"});
                res.write(`<h2>사용자 전체 조회 중 에러 발생</h2>`);
                res.write(`<p>${err.stack}</p>`);
                res.end();
            }
            
            // 결과 있으면 목록을 응답 전송
            if (result) {
                console.dir(result);
                
                res.writeHead('200', { "Content-Type": "text/html;charset=utf8"});
    
                // 뷰 템플릿을 이용해 렌더링 후 전송
                const context = { result: result };
                req.app.render('listUser', context, (err, html) => {
                    if (err) {
                        throw err;
                    }
                    res.end(html);
                })
                // 결과 객체 없으면 응답 전송
            } else {
                res.writeHead('200', { "Content-Type": "text/html;charset=utf8"});
                res.write(`<h2>사용자 전체 조회 실패</h2>`);
                res.end();
            }
        });
    }
}

// 1. 사용자 회원가입
function addUser(database, id, name, password, callback) {
    console.log('회원가입 프로세스 시작');
    
    const user = new userModel({
        id: id,
        name: name,
        password: password
    });
    
    user.save((err) => {
        if (err) {
            callback(err, null);
        }
        
        console.log('사용자 추가 완료');
        callback(null, user);
    });
}

// 2. 사용자 로그인
function authUser(database, id, password, callback) {
    console.log('authUser call');
    
    // 아이디와 비밀번호로 사용자 검색
    userModel.findById(id, function(err, result) {
        if (err) {
            callback(err, null);
        }
        
        console.log(`아이디 : ${id} 비밀번호 : ${password}로 조회`);
        console.dir(result);
        
        if (result.length > 0) {
            console.log('사용자 아이디 검색 완료');
            
            // 비밀번호 확인
            const user = new userModel({ id: id});
            const authenticated = user.authenticate(password, result[0]._doc.salt, result[0]._doc.hashedPassword);
            
            if (authenticated) {
                console.log('비밀번호 일치');
                callback(null, result);
            } else {
                console.log('비밀번호 불일치');
                callback(null, null);
            }
        } else {
            console.log('사용자 검색 불가');
            callback(null, null);
        }
    });
}


module.exports = {
    init,
    signUp,
    login,
    userList
};