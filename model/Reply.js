
//一级回复表
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BaseModel = require('./base_model');
const shortid = require('shortid');
const ReplySchema = new Schema({
    // 留言的ID
    _id: {
        type: String,
        default: shortid.generate,
        unique: true
    },
    // 留言的内容
    content: {
        type: String,
        require: true
    },
    // 留言的人
    author: {
        type: String,
        ref: 'User'
    },
    // 留言的时间
    create_time: {
        type: Date,
        default: Date.now
    },
    // 二级回复的ID
    reply_id: {
        type: String
    },
    // 对应的问题
    question_id: {
        type: String,
        ref: 'Question'
    },
    // 点赞的人
    likes: {
        type: [String],
        ref: 'User'
    },
    // 点踩的人
    dislikes: {
        type: [String],
        ref: 'User'
    },
    // 二级回复的数量.
    comment_num: {
        type: Number,
        default: 0
    }
})
ReplySchema.plugin(BaseModel);
ReplySchema.statics = {
    getRepliesByQuestionId: (question_id, callback) => {
        Reply.find({'question_id': question_id}).sort({'create_time': 1}).populate('author').exec(callback)
    },
    getQuestionByQuery:(question_id,opt,callback)=> {
        Question.find({'question_id': question_id},{},opt).populate('author').populate('last_reply').populate('last_reply_author').then((articles)=>{
            if(articles.length == 0){
                return callback(null,[]);
            }
            return callback(null,articles);
        }).catch(err=>{
            return callback(err);
        })
    },
    // 查询符合条件的有多少条数据
    getCountByQuery:(query,callback)=>{
        Question.count(query).then((all_articles)=>{
            return callback(null,all_articles);
        }).catch(err=>{
            return callback(err);
        })
    },
    getRepliesById: (id, callback) => {
        Reply.find({'_id': id}).sort({'create_time': 1}).populate('author').exec(callback)
    },
    showRepliesAll: (question_id, callback) => {
        Reply.find({'question_id': question_id}).sort({'create_time': 1}).populate('author').exec(callback)
    },
    getRepliesAll: (callback) => {
        Reply.find({}).sort({'create_time': 1}).populate('author').exec(callback)
    },
    // 某个用户回复的问题
    getRepliesByAuthorId:(author_id,opt,callback)=>{
        Reply.find({author:author_id},{},opt).populate('author').populate('question_id').then(replies=>{
            return callback(null,replies);
        }).catch(err=>{
            return callback(err);
        })
    }
}
const Reply = mongoose.model('Reply', ReplySchema);
module.exports = Reply
