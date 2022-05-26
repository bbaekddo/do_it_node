const add = function(req, res) {
    console.log(`cafe 모둘 안에 있는 add 호출됨`);
    
    const paramName = req.body.name || req.query.name;
    const paramAddress = req.body.address || req.query.address;
    const paramPhone = req.body.phone || req.query.phone;
    const paramLongitude = req.body.longitude || req.query.longitude;
    const paramLatitude = req.body.latitude || req.query.latitude;
    
    console.log(`요청 파라미터 : ${paramName}, ${paramAddress}, ${paramPhone}, ${paramLongitude}, ${paramLatitude}`);
    
    // 데이터베이스 객체 참조
    const globalDB = req.app.get('database');
    
    // 데이터베이스 객체가 초기화 된 경우
    if (globalDB.db) {
        addCafe(globalDB, paramName, paramAddress, paramPhone, paramLongitude, paramLatitude,
            function(error, result) {
            if (error) {
                console.error(`카페 추가 중 오류 발생 : ${error.stack}`);
                
                res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8' });
                res.write(`<h2>카페 추가 중 에러 발생</h2>`);
                res.write(`<p>${error.stack}</p>`);
                res.end();
            }
            
            if (result) {
                console.dir(result);
                
                res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8' });
                res.write(`<h2>카페 추가 성공</h2>`);
                res.end();
            } else{
                res.writeHead('200', {'Content-Type': 'text/html; charset=utf8' });
                res.write(`<h2>카페 추가 실패</h2>`);
                res.end();
            }
        });
    } else {
        res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8 '});
        res.write(`<h2>데이터베이스 연결 실패</h2>`);
        res.end();
    }
};

// 카페 추가하는 함수
function addCafe(database, name, address, phone, longitude, latitude, callback) {
    console.log(`cafe 호출됨`);
    
    // cafe 인스턴스 생성
    const cafe = new database.cafeModel({
        name: name,
        address: address,
        phone: phone,
        geometry: { type: 'Point', coordinates: [longitude, latitude] }
    });
    
    cafe.save((error) => {
        if (error) {
            callback(error, null);
        }
    
        console.log(`카페 데이터 추가함`);
        callback(null, cafe);
    })
}

// 모든 카페 조회
const list = function(req, res) {
    console.log(`cafe 모듈안에 있는 list 호출됨`);
    
    // 데이터베이스 객체 참조
    const globalDB = req.app.get('database');
    
    // 데이터베이스 객체가 초기화된 경우
    if (globalDB.db) {
        globalDB.cafeModel.findAll((error, results) => {
            if (error) {
                console.error(`카페 리스트 조회 중 에러 발생 : ${error.stack}`);
                
                res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8' });
                res.write(`<h2>카페 리스트 조회 중 에러 발생</h2>`);
                res.write(`<p>${error.stack}</p>`);
                res.end();
            }
            
            if (results) {
                console.dir(results);
                res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8' });
                res.write(`<h2>카페 리스트</h2>`);
                res.write(`<div><ul>`);
                
                for (let i = 0; i < results.length; i++) {
                    const currentName = results[i]._doc.name;
                    const currentAddress = results[i]._doc.address;
                    const currentPhone = results[i]._doc.phone;
                    const currentLongitude = results[i]._doc.geometry.coordinates[0];
                    const currentLatitude = results[i]._doc.geometry.coordinates[1];
                    
                    res.write(`<li>#${i + 1} : ${currentName}, ${currentAddress}, ${currentPhone}, ${currentLongitude}, ${currentLatitude}</li>`);
                }
                
                res.write(`</ul></div>`);
                res.end();
            } else {
                res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8' });
                res.write(`<h2>카페 리스트 조회 실패</h2>`);
                res.end();
            }
        });
    } else {
        res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8' });
        res.write(`<h2>데이터베이스 연결 실패</h2>`);
        res.end();
    }
}

// 근처 카페 검색
const findNear = function(req, res) {
    console.log(`cafe 모듈 안에 있는 findNear 호출됨`);
    
    const maxDistance = 1000;
    
    const paramLongitude = req.body.longitude || req.query.longitude;
    const paramLatitude = req.body.latitude || req.query.latitude;
    
    console.log(`요청 파라미터 : ${paramLongitude}, ${paramLatitude}`);
    
    // 데이터베이스 객체 참조
    const globalDB = req.app.get('database');
    
    // 데이터베이스가 초기화 된 경우
    if (globalDB.db) {
        globalDB.cafeModel.findNear(paramLongitude, paramLatitude, maxDistance, function(error, results) {
            if (error) {
                console.error(`카페 검색 중 에러 발생 : ${error.stack}`);
                
                res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8' });
                res.write(`<h2>카페 검색 중 에러 발생</h2>`);
                res.write(`<p>${error.stack}</p>`);
                res.end();
            }
            
            if (results.length > 0) {
                console.dir(results);
                res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8' });
                res.write(`<h2>가까운 카페</h2>`);
                res.write(`<div><ul>`);
                
                for (let i = 0; i < results.length; i++) {
                    const currentName = results[i]._doc.name;
                    const currentAddress = results[i]._doc.address;
                    const currentPhone = results[i]._doc.phone;
                    const currentLongitude = results[i].geometry.coordinates[0];
                    const currentLatitude = results[i].geometry.coordinates[1];
                    
                    res.write(`<li>#${i + 1} : ${currentName}, ${currentAddress}, ${currentPhone}, ${currentLongitude}, ${currentLatitude}</li>`);
                }
                
                res.write(`</ul></div>`);
                res.end();
            } else {
                res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8' });
                res.write(`<h2>가까운 카페 조회 실패</h2>`);
                res.end();
            }
        });
    } else {
        res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8' });
        res.write(`<h2>데이터베이스 연결 실패</h2>`);
        res.end();
    }
}

// 일정 범위 안의 카페 검색
const findWithin = function(req, res) {
    console.log(`cafe 모듈 안에 있는 findWithin 호출됨`);
    
    const paramTopLeftLongitude = req.body.topLeftLongitude || req.query.topLeftLongitude;
    const paramTopLeftLatitude = req.body.topLeftLatitude || req.query.topLeftLatitude;
    const paramBottomRightLongitude = req.body.bottomRightLongitude || req.query.bottomRightLongitude;
    const paramBottomRightLatitude = req.body.bottomRightLatitude || req.query.bottomRightLatitude;
    
    console.log(`요청 파라미터 : ${paramTopLeftLongitude}, ${paramTopLeftLatitude}, ${paramBottomRightLongitude}, ${paramTopLeftLatitude}`);
    
    // 데이터베이스 객체 참조
    const globalDB = req.app.get('database');
    
    // 데이터베이스 객체가 초기화 된 경우
    if (globalDB.db) {
        globalDB.cafeModel.findWithin(paramTopLeftLongitude, paramTopLeftLatitude, paramBottomRightLongitude, paramBottomRightLatitude, function(error, results) {
            if (error) {
                console.error(`카페 검색 중 에러 발생 : ${error.stack}`);
                
                res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8' });
                res.write(`<h2>카페 검색 중 에러 발생</h2>`);
                res.write(`<p>${error.stack}</p>`);
                res.end();
            }
            
            if (results.length > 0) {
                console.dir(results);
                
                res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8' });
                res.write(`<h2>범위 내 카페</h2>`);
                res.write(`<div><ul>`);
                
                for (let i = 0; i < results.length; i++) {
                    const cafeName = results[i]._doc.name;
                    const cafeAddress = results[i]._doc.address;
                    const cafePhone = results[i]._doc.phone;
                    const cafeLongitude = results[i]._doc.geometry.coordinates[0];
                    const cafeLatitude = results[i]._doc.geometry.coordinates[1];
                    
                    res.write(`<li>#${i + 1} : ${cafeName}, ${cafeAddress}, ${cafePhone}, ${cafeLongitude}, ${cafeLatitude}</li>`);
                }
                
                res.write(`</ul></div>`);
                res.end();
            } else {
                res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8' });
                res.write(`<h2>반경 내 카페 조회 실패</h2>`);
                res.end();
            }
        });
    } else {
        res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8' });
        res.write(`<h2>데이터베이스 연결 실패</h2>`);
        res.end();
    }
}

// 반경 안의 카페 검색
const findCircle = function(req, res) {
    console.log(`cafe 모듈 안에 있는 findCircle 호출됨`);
    
    const paramLongitude = req.body.longitude || req.query.longitude;
    const paramLatitude = req.body.latitude || req.query.latitude;
    const paramRadius = req.body.radius || req.query.radius;
    
    console.log(`요청 파라미터 : ${paramLongitude}, ${paramLatitude}, ${paramRadius}`);
    
    // 데이터베이스 객체 참조
    const globalDB = req.app.get('database');
    
    // 데이터베이스 객체가 초기화 된 경우
    if (globalDB.db) {
        globalDB.cafeModel.findCircle(paramLongitude, paramLatitude, paramRadius, function(error, results) {
            if (error) {
                console.error(`카페 검색 중 에러 발생 : ${error.stack}`);
                
                res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8' });
                res.write(`<h2>카페 검색 중 에러 발생</h2>`);
                res.write(`<p>${error.stack}</p>`);
                res.end();
            }
    
            if (results.length > 0) {
                console.dir(results);
        
                res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8' });
                res.write(`<h2>반경 내 카페</h2>`);
                res.write(`<div><ul>`);
        
                for (let i = 0; i < results.length; i++) {
                    const cafeName = results[i]._doc.name;
                    const cafeAddress = results[i]._doc.address;
                    const cafePhone = results[i]._doc.phone;
                    const cafeLongitude = results[i]._doc.geometry.coordinates[0];
                    const cafeLatitude = results[i]._doc.geometry.coordinates[1];
            
                    res.write(`<li>#${i + 1} : ${cafeName}, ${cafeAddress}, ${cafePhone}, ${cafeLongitude}, ${cafeLatitude}</li>`);
                }
        
                res.write(`</ul></div>`);
                res.end();
            } else {
                res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8' });
                res.write(`<h2>범위 내 카페 조회 실패</h2>`);
                res.end();
            }
        });
    } else {
        res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8' });
        res.write(`<h2>데이터베이스 연결 실패</h2>`);
        res.end();
    }
}

module.exports = {
    add,
    list,
    findNear,
    findWithin,
    findCircle
};