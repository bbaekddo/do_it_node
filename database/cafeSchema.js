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
    
    // 스키마에 static 메소드 추가
    cafeSchema.static('findAll', function(callback) {
        return this.find({}, callback);
    });
    
    console.log('Cafe 스키마 생성 완료');
    
    return cafeSchema;
}

module.exports = schema;