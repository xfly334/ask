
//用户信息表
const mongoose = require('mongoose');
// 引入shortid生成ID插件
const shortid = require('shortid');
const Schema = mongoose.Schema;
const BaseModel = require('./base_model');
const UserSchema = new Schema({
    //定义字段
    _id: {
        type: String,
        default: shortid.generate,
        unique: true
    },
    // 用户名
    name: {
        type: String,
        required: true
    },
    // 密码
    password: {
        type: String,
        required: true
    },
    // 邮箱
    email: {
        type: String,
        required: true
    },
    // 个人简介
    motto: {
        type: String,
        default: '这家伙很懒,什么都没有留下...'
    },
    // 个人头像
    avatar: {
        type: String,
        default: '/images/default-avatar.jpg'
    },
    // 创建时间
    create_time: {
        type: Date,
        default: Date.now
    },
    // 修改时间
    update_time: {
        type: Date,
        default: Date.now
    },
    // 用户积分
    score: {
        type: Number,
        default: 0
    },
    // 发表文章数量
    article_count: {
        type: Number,
        default: 0
    },
    // 回复的数量
    reply_count: {
        type: Number,
        default: 0
    }
})
// 给这个User表添加静态方法 statics添加自定义方法
UserSchema.statics = {
    getUserByName: (name, callback) => {
        User.findOne({name: name}, callback);
    },
    getUserByEmail: (email, callback) => {
        User.findOne({email: email}, callback)
    },
    getUserById: (id, callback) => {
        User.findOne({_id: id}, callback)
    },
    getUserByNames: (names, callback) => {
        if(names.length == 0) {
            return callback(null, []);
        }
        User.find({name: {$in: names}}, callback);
    },
    // 所有用户
    getUserAll: (callback) => {
        User.find({}).sort({score: -1}).exec(callback);
    },
    // 用户分页显示的数据
    getUserCount: (callback) => {
        User.find({}).limit(10).sort({score: -1}).exec(callback);
    },
    // 用户分页
    getUserPage: (limit,skip,callback) => {
        User.find({}).limit(limit).skip(skip).sort({score: -1}).exec(callback);
    }
}
UserSchema.plugin(BaseModel);
const User = mongoose.model('User', UserSchema);
module.exports = User
