const utils = require('../utils/utils');

const schema = {};

schema.createCustomSchema = (mongoose) => {
    // 스키마 정의
    const postSchema = mongoose.Schema({
        title: { type: String, trim: true, 'default': '' },
        contents: { type: String, trim: true, 'default': '' },
        writer: { type: mongoose.Schema.ObjectId, ref: 'users' },
        tags: { type: [], 'default': '' },
        createdAt: { type: Date, index: { unique: false }, 'default': Date.now },
        updatedAt: { type: Date, index: { unique: false }, 'default': Date.now },
        comments: [{
            contents: { type: String, trim: true, 'default': '' },
            writer: { type: mongoose.Schema.ObjectId, ref: 'users' },
            createdAt: { type: Date, 'default': Date.now }
        }]
    });
    
    // 필수 속성
    postSchema.path('title').required(true, '글 제목을 입력하셔야 합니다');
    postSchema.path('contents').required(true, '글 내용을 입력하셔야 합니다');
    
    // 메소드 추가
    postSchema.method = {
        // 글 저장
        savePost: function(callback) {
            // self를 this로 그냥 두면 안되나???
            const self = this;
            
            this.validate(function(error) {
                if (error) {
                    return callback(error);
                }
                
                self.save(callback);
            })
        },
        // 댓글 추가
        addComment: function(user, comment, callback) {
            this.comment.push({
                contents: comment.contents,
                writer: user._id
            });
            
            this.save(callback);
        },
        // 댓글 삭제
        deleteComment: function(id, callback) {
            const index = utils.indexOf(this.comments, { id: id });
            
            if (~index) {
                this.comments.splice(index, 1);
            } else {
                return callback(`ID [${id}]를 가진 댓글 객체를 찾을 수 없습니다`);
            }
            
            this.save(callback);
        }
    }
    
    postSchema.statics = {
        // ID로 글 찾기
        load: function(id, callback) {
            this.findOne({ _id: id })
                .populate('writer', 'name provider emial')
                .populate('comments.writer')
                .exec(callback);
        },
        list: function(options, callback) {
            const criteria = options.criteria || {};
            
            this.find(criteria)
                .populate('writer', 'name provider email')
                .sort({ 'createdAt': -1 })
                .limit(Number(options.perPage))
                .skip(options.perPage * options.page)
                .exec(callback);
        }
    }
    
    console.log(`postSchema 정의 완료`);
    
    return postSchema;
};

module.exports = {
    schema
};