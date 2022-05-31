const schema = {};

schema.createCustomSchema = (mongoose) => {
    // 스키마 정의
    const cafeSchema = mongoose.Schema({
        name: { type: String, index: 'hashed', 'default': '' },
        address: { type: String, 'default': '' },
        phone: { type: String, 'default': '' },
        geometry: {
            'type': { type: String, 'default': 'Point' },
            coordinates: [{ type: 'Number' }]
        },
        createdAt: { type: Date, index: { unique: false }, 'default': Date.now },
        updatedAt: { type: Date, index: { unique: false }, 'default': Date.now }
    });
    
    // 공간 인덱스 생성
    cafeSchema.index({ geometry: '2dsphere' });
    
    // 전체 카페 조회 static 함수
    cafeSchema.static('findAll', function(callback) {
        return this.find({}, callback);
    });
    
    // 근처 카페 조회 static 함수
    cafeSchema.static('findNear', function(longitude, latitude, maxDistance, callback) {
        console.log(`근처 카페 조회 함수 호출됨`);
        
        this.find().where('geometry').near({
            center: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)]},
            maxDistance: maxDistance,
        }).limit(1).exec(callback);
    });
    
    // 일정 범위 안의 카페 조회 static 함수
    cafeSchema.static('findWithin', function(topLeftLongitude, topLeftLatitude, bottomRightLongitude, bottomRightLatitude, callback) {
        console.log(`일정 범위 카페 조회 함수 호출됨`);
        
        this.find().where('geometry').within({
            box : [
                [parseFloat(topLeftLongitude), parseFloat(topLeftLatitude)],
                [parseFloat(bottomRightLongitude), parseFloat(bottomRightLatitude)]
            ]
        }).exec(callback);
    });
    
    // 반경 안의 카페 조회 static 함수
    cafeSchema.static('findCircle', function(longitude, latitude, radius, callback) {
        console.log(`반경 안의 카페 조회 함수 호출됨`);
        
        // change radian : 1/6371 -> 1km
        this.find().where('geometry').within({
            center: [parseFloat(longitude), parseFloat(latitude)],
            radius: parseFloat(radius/6371000),
            unique: true,
            spherical: true
        }).exec(callback);
    });
    
    console.log('Cafe 스키마 생성 완료');
    
    return cafeSchema;
}

module.exports = schema;