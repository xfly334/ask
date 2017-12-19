
const validator = require('validator');
const Reply = require('../model/Reply');
const Comment = require('../model/Comment');
const Question = require('../model/Question');
const User = require('../model/User');
// 引入数据库操做文件db.js
const DBSet = require('../model/db');
// 一级回复的赞
exports.replyLikes = (req, res, next) => {
    let question_id = req.params.question_id;
    let reply_id = req.body.reply_id;
    let user_id = req.session.user._id;
    let reply = Reply.find({'_id': reply_id});
    reply.exec().then(replies => {
        let likes = replies[0].likes;
        if (likes.length == 0) {
            likes.push(user_id);
        } else {
            // 循环判断是否点过赞，若点过则取消赞
            let index = likes.indexOf(user_id);
            if (index == -1) {
                likes.push(user_id);
            } else {
                likes.splice(index, 1)
            }
        }
        Reply.update({'_id': reply_id}, {$set: {'likes': likes}}).then(result => {
            res.json({data: likes.length})
        }).catch(err => {
            res.end(err);
        });
    }).catch(err => {
        res.end(err);
    })
}
// 一级回复的踩
exports.replyDislikes = (req, res, next) => {
    let reply_id = req.body.reply_id;
    let user_id = req.session.user._id;
    let reply = Reply.find({'_id': reply_id});
    reply.exec().then(replies => {
        let dislikes = replies[0].dislikes;
        // 判断是否有人点过赞
        if (dislikes.length == 0) {
            dislikes.push(user_id);
        } else {
            // 循环判断是否点过赞，若点过则取消赞
            let index = dislikes.indexOf(user_id);
            if (index == -1) {
                dislikes.push(user_id);
            } else {
                dislikes.splice(index, 1)
            }
        }
        Reply.update({_id: reply_id}, {$set: {"dislikes": dislikes}}).then(result => {
            res.json({data: dislikes.length});
        }).catch(err => {
            res.end(err);
        });
    }).catch(err => {
        res.end(err);
    })
}
// 二级回复的赞
exports.commentLikes = (req, res, next) => {
    let question_id = req.params.question_id;
    let comment_id = req.body.comment_id;
    let user_id = req.session.user._id;
    let comment = Comment.find({'_id': comment_id});
    comment.exec().then(comments => {
        let likes = comments[0].likes;
        if (likes.length == 0) {
            likes.push(user_id);
        } else {
            // 循环判断是否点过赞，若点过则取消赞
            let index = likes.indexOf(user_id);
            if (index == -1) {
                likes.push(user_id);
            } else {
                likes.splice(index, 1)
            }
        }
        Comment.update({_id: comment_id}, {$set: {'likes': likes}}).then(result => {
            res.json({data: likes.length})
        }).catch(err => {
            res.end(err);
        });
    }).catch(err => {
        res.end(err);
    })
}
// 二级回复的踩
exports.commentsDislikes = (req, res, next) => {
    let question_id = req.params.question_id;
    let comment_id = req.body.comment_id;
    let user_id = req.session.user._id;
    let comment = Comment.find({'_id': comment_id});
    comment.exec().then(comments => {
        let dislikes = comments[0].dislikes;
        if (dislikes.length == 0) {
            dislikes.push(user_id);
        } else {
            // 循环判断是否点过赞，若点过则取消赞
            let index = dislikes.indexOf(user_id);
            if (index == -1) {
                dislikes.push(user_id);
            } else {
                dislikes.splice(index, 1)
            }
        }
        Comment.update({_id: comment_id}, {$set: {'dislikes': dislikes}}).then(result => {
            res.json({data: dislikes.length})
        }).catch(err => {
            res.end(err);
        });
    }).catch(err => {
        res.end(err);
    })
}