
// 静态资源的对象
const mapping = require('../static');
const setting = require('../setting');
const validator = require('validator');
const User = require('../model/User');
const at = require('../common/at');
const Reply = require('../model/Reply');
// 引入问题的模型
const Question = require('../model/Question');
//新建问题的处理函数
exports.create = (req, res, next) => {
    res.render('create', {
        title: '新建问题',
        layout: 'indexTemplate',
        resource: mapping.create,
        categorys: setting.categorys
    })
}
//新建行为的处理函数
exports.postCreate = (req, res, next) => {
    let title = validator.trim(req.body.title);
    let category = validator.trim(req.body.category);
    let content = validator.trim(req.body.content);
    let error;
    if (!validator.isLength(title, {max: 50})) {
        error = '标题长度不合法,请重新输入';
    }
    if (!validator.isLength(content, {min: 1})) {
        error = '问题内容长度不合法,请重新输入';
    }
    if (error) {
        return res.end(error);
    } else {
        //验证成功后
        req.body.author = req.session.user._id;
        let newQuestion = new Question(req.body);
        newQuestion.save().then(question => {
            //某个人发布一篇文章，积分+5,发布数量+1
            User.getUserById(req.session.user._id, (err, user) => {
                if (err) {
                    return res.end(err);
                }
                user.score += 5;
                user.article_count += 1;
                user.save();
                req.session.user = user;
                //返回的是一个添加问题的页面地址。
                res.json({url: `/question/${question._id}`})
            })
            //发送at消息
            at.sendMessageToMentionUsers(content, question._id, req.session.user._id, (err, msg) => {
                if (err) {
                    console.log(err);
                }
                return;
            });
        }).catch(err => {
            return res.end(err);
        })
    }
}
//编辑问题的处理函数
exports.edit = (req, res, next) => {
    let question_id = req.params.id;
    Question.getFullQuestion(question_id, (err, question) => {
        if (err) {
            return res.end(err);
        }
        return res.render('edit', {
            title: 'Fly社区-编辑话题',
            layout: 'indexTemplate',
            resource: mapping.create,
            categorys: setting.categorys,
            question: question
        })
    })
}
//编辑行为的处理函数
exports.postEdit = (req, res, next) => {
    let question_id = req.params.id;
    let title = validator.trim(req.body.title);
    let category = validator.trim(req.body.category);
    let content = validator.trim(req.body.content);
    //首先检查下这篇文章是否存在
    Question.getFullQuestion(question_id, (err, question) => {
        if (!question) {
            return end('此话题已经不存在了,请重新检查');
        }
        if (String(question.author._id) === String(req.session.user._id)) {
            let error;
            //获取所有的分类
            if (!validator.isLength(title, {max: 20})) {
                error = '文章的标题长度不能超过20个字符'
            }
            if (!validator.isLength(content, 0)) {
                error = '文章的内容不能为空';
            }

            if (error) {
                res.end(error);
            } else {
                question.title = title;
                question.content = content;
                question.category = category;
                question.update_time = new Date();
                question.save().then((article) => {
                    at.sendMessageToMentionUsers(content, article._id, req.session.user._id);
                    res.json({url: `/question/${article._id}`});
                }).catch(err => {
                    return res.end(err);
                })
            }
        } else {
            return res.end(err);
        }
    })
}
//删除行为的处理函数
exports.delete = (req, res, next) => {
    let question_id = req.params.id;
    Question.getFullQuestion(question_id,(err,question) => {
        if(err) {
            return res.end(err);
        }
        question.author.score -= 5;
        question.author.article_count -= 1;
        question.author.save();
        question.deleted = true;
        question.save().then(result => {
            res.json({success: true, message:'删除成功'})
            res.redirect('/');
        }).catch(err => {
            return res.json({success:true, message: err})
        })
    })
}
//问题详情的处理函数
exports.index = (req, res, next) => {
    // 问题的ID
    let question_id = req.params.id;
    // 当前登录的用户
    let currentUser = req.session.user._id;
    // 1.问题的信息
    // 2.问题的回复信息
    // 3.问题作者的其他相关文章推荐
    Question.getFullQuestion(question_id, (err, question) => {
        if (err) {
            return res.end(err);
        }
        if (question == null) {
            return res.render('error', {
                title: '错误页面',
                message: '该问题已被删除!',
                layout: 'indexTemplate',
                resource: mapping.error
            })
        }
        // 给问题的内容如果有@用户，给@用户添加一个链接
        question.content = at.linkUsers(question.content);
        // 问题的访问量+1
        question.click_num += 1;
        question.save();
        // 来获取文章对应的所有的回复
        // reply表
        Reply.getRepliesByQuestionId(question._id, (err, replies) => {
            if (err) {
                return res.end(err)
            }
            if (replies.length > 0) {
                replies.forEach((reply, index) => {
                    reply.content = at.linkUsers(reply.content)
                })
            }
            Question.getOtherQuestions(question.author._id, question._id, (err, questions) => {
                if (err) {
                    return res.end(err)
                }
                return res.render('question', {
                    title: 'Fly社区-话题详情',
                    layout: 'indexTemplate',
                    resource: mapping.question,
                    currentUser: currentUser,
                    question: question,
                    others: questions,
                    replies: replies
                })
            })
        })
    })
}
// 一级回复加载全部
exports.RepliesAll = (req, res, next) => {
    let question_id = req.params.id;
    Question.getFullQuestion(question_id, (err, question) => {
        Reply.showRepliesAll(question_id, (err, replies) => {
            res.render('question-list', {
                title: 'Fly社区-话题详情',
                layout: '',
                question: question,
                replies: replies
            })
        })
    })
}
// 收藏
exports.postCollect = (req, res, next) => {
    let user_id = req.session.user._id;
    let question_id = req.params.id;
    let question = Question.find({'_id':question_id});
    question.exec().then(result => {
        let collect = result[0].collect;
        if (collect.length == 0) {
            collect.push(user_id);
        } else {
            let index = collect.indexOf(user_id);
            if (index == -1) {
                collect.push(user_id);
            } else {
                collect.splice(index, 1)
            }
        }
        Question.update({'_id': question_id},{$set: {'collect': collect}}).then(result => {
            res.json({user_id:user_id,collect: collect})
        }).catch(err => {
            res.end(err);
        });
    }).catch(err => {
        res.end(err);
    })
}

