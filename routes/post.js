const addPost = function(req, res) {
    console.log(`post 모듈 안에 있는 addPost 호출됨`);
    
    const paramTitle = req.body.title || req.query.title;
    const paramContents = req.body.contents || req.query.contents;
    const paramWriter = req.body.writer || req.query.writer;
    
    console.log(`요청 파라미터 : ${paramTitle}, ${paramContents}, ${paramWriter}`);
    
    // 데이터베이스 객체 참조
    const globalDB = req.app.get('database');
    
    // 데이터베이스 객체가 초기화 된 경우
    if (globalDB.db) {
        globalDB.userModel.findByEmail(paramWriter, function(error, results) {
            if (error) {
                console.error(`게시판 글 추가중 오류 발생 : ${error.stack}`);
                
                res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8' });
                res.write(`<h2>게시판 글 추가중 오류 발생</h2>`);
                res.write(`<p>${error.stack}</p>`);
                res.end();
            }
            
            // 사용자를 검색할 수 없을 때
            if (results === undefined || results.length < 1) {
                res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8' });
                res.write(`<h2>사용자 [${paramWriter}]를 찾을 수 없습니다</h2>`);
                res.end();
            }
            
            const userObjectId = results[0]._doc._id;
    
            console.log(`사용자 ObjectId : ${paramWriter} -> ${userObjectId}`);
            
            // save()로 저장
            const post = new globalDB.postModel({
                title: paramTitle,
                contents: paramContents,
                writer: paramWriter
            });
            
            post.savePost(function(error, result) {
                if (error) throw error;
    
                console.log(`글 데이터 추가함`);
                console.log(`게시판 글을 생성했습니다 : ${post._id}`);
                
                return res.redirect(`/process/showPost/${post._id}`);
            });
        });
    }
}

const showPost = function(req, res) {
    console.log(`post 모듈 안에 있는 showPost 호출됨`);
    
    // URL 파라미터로 전달됨
    const paramId = req.body.id || req.query.id;
    
    console.log(`요청 파라미터 : ${paramId}`);
    
    // 데이터베이스 객체 참조
    const globalDB = req.app.get('database');
    
    // 데이터베이스 객체가 초기화 된 경우
    if (globalDB.db) {
        globalDB.postModel.load(paramId, function(error, results) {
            if (error) {
                console.error(`게시판 글 조회 중 오류 발생 : ${error.stack}`);
                
                res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8' });
                res.write(`<h2>게시판 글 조회 중 오류 발생</h2>`);
                res.write(`<p>${error.stack}</p>`);
                res.end();
            }
            
            if (results) {
                console.dir(results);
                
                res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8' });
                
                // 뷰 템플릿을 사용하여 렌더링한 후 전송
                const context = {
                    title: '글 조회',
                    posts: results,
                    Entities: Entities
                };
                
                req.app.render('showPost', context, function(error, html) {
                    if (error) throw error;
    
                    console.log(`응답 웹 문서 : ${html}`);
                    res.end(html);
                });
            }
        });
    }
};

module.exports = {
    addPost,
    showPost
};