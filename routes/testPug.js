const test = (req, res) => {
    console.log('testPug Call...');
    
    res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8' });
    
    // 뷰 템플릿으로 렌더링 후 전송
    const context = {};
    req.app.render('testSuccess', context, (err, html) => {
        console.log(`rendered ${html}`);
        
        res.end(html);
    });
};

module.exports = {
    test
};