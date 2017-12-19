
// 引入动态的css设置
const mapping = require('../static');
const formidable = require('formidable');
const moment = require('moment');
const fs = require('fs');
const gm = require('gm');
// 引入User
const User = require('../model/User');
// 引入Question表
const Question = require('../model/Question');
// 引入Reply表
const Reply = require('../model/Reply');
const validator = require('validator');
//个人设置的处理函数
exports.setting = (req, res, next) => {
    res.render('setting', {
        title: 'Fly社区-个人设置',
        layout: 'indexTemplate',
        resource: mapping.setting
    })
}
//更新头像的处理函数
exports.updateImage = (req, res, next) => {
    //初始化
    let form = new formidable.IncomingForm();
    form.uploadDir = 'public/upload/images/';
    let updatePath = 'public/upload/images/';
    let smallImgPath = "public/upload/smallimgs/";
    let files = [];
    let fields = [];
    form.on('field', function (field, value) {
        fields.push([field, value]);
    }).on('file', function (field, file) {
        //文件的name值
        //console.log(field);
        //文件的具体信息
        //console.log(file);
        files.push([field, file]);
        let type = file.name.split('.')[1];
        let date = new Date();
        let ms = moment(date).format('YYYYMMDDHHmmss').toString();
        let newFileName = 'img' + ms + '.' + type;
        fs.rename(file.path, updatePath + newFileName, function (err) {
            var input = updatePath + newFileName;
            var out = smallImgPath + newFileName;
            gm(input).resize(100, 100, '!').autoOrient().write(out, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('done');
                    //压缩后再返回，否则的话，压缩会放在后边，导致链接失效
                    return res.json({
                        error: '',
                        initialPreview: ['<img src="' + '/upload/smallimgs/' + newFileName + '">'],
                        url: out
                    })
                }
            });
        })
    })
    form.parse(req);
}
//更新个人资料的处理函数
exports.updateUser = (req, res, next) => {
    let id = req.session.user._id;
    let motto = req.body.motto;
    let avatar = req.body.avatar;
    let error;
    if (!validator.isLength('motto', 0)) {
        error = '个性签名不能为空';
    }
    if (!validator.isLength('avatar', 0)) {
        error = '头像的地址不能为空';
    }
    if (error) {
        res.end(error);
    } else {
        // 查询数据库对应用户信息
        User.getUserById(id, (err, user) => {
            if (err) {
                return res.end(err);
            }
            if (!user) {
                return res.end('用户不存在');
            }
            user.update_time = new Date();
            user.motto = motto;
            user.avatar = avatar;
            user.save().then((user) => {
                req.session.user = user;
                return res.end('success');
            }).catch((err) => {
                return res.end(err);
            })
        })
    }
}
//用户排名
exports.all = (req, res, next) => {
    User.getUserAll((err, userAll) => {
        let total = userAll.length;
        let page = Math.ceil(total / 10);
        let pageArr = [];
        for (let i = 1; i <= page; i++) {
            pageArr.push(i);
        }
        User.getUserCount((err, userCount) => {
            res.render('user-all', {
                title: 'Fly社区-用户排名',
                layout: 'indexTemplate',
                resource: mapping.userAll,
                userCount: userCount,
                pageArr: pageArr,
                currentPage: 1
            })
        })

    })
}
//个人信息
exports.index = (req, res, next) => {
    // 得到用户的姓名
    let name = req.params.name;
    // 1.根据用户的姓名，查到用户所对应的信息
    User.getUserByName(name, (err, user) => {
        if (err) {
            return res.end(err)
        }
        let query = {author: user._id};
        let opt = {limit: 10, sort: '-create_time'};
        let user_id = user._id;
        // 2.这个用户发布的文章 Question表
        Question.getQuestionByQuery({},{},(err,questions) => {
            Question.getQuestionByQuery(query, opt, (err, question) => {
                if (err) {
                    return res.end(err)
                }
                Reply.getRepliesByAuthorId(user_id, opt, (err, replies) => {
                    return res.render('user', {
                        title: "Fly社区-个人中心",
                        layout: 'indexTemplate',
                        resource: mapping.user,
                        user: user,
                        question: question,
                        replies: replies,
                        questions:questions
                    })
                })
            })
        })

    })
}
//发布问题列表
exports.questions = (req, res, next) => {
    // 得到用户的姓名
    let name = req.params.name;
    // 1.根据用户的姓名，查到用户所对应的信息
    User.getUserByName(name, (err, user) => {
        if (err) {
            return res.end(err)
        }
        let query = {author: user._id};
        let opt = {sort: '-create_time'};
        let user_id = user._id;
        Question.getQuestionByQuery(query, opt, (err, question) => {
            if (err) {
                return res.end(err)
            }
            return res.render('user-questions', {
                title: "个人中心",
                layout: 'indexTemplate',
                resource: mapping.user,
                user: user,
                question: question,
            })
        })
    })
}
//回复问题列表
exports.replys = (req, res, next) => {
    // 得到用户的姓名
    let name = req.params.name;
    // 1.根据用户的姓名，查到用户所对应的信息
    User.getUserByName(name, (err, user) => {
        if (err) {
            return res.end(err)
        }
        let query = {author: user._id};
        let opt = {sort: '-create_time'};
        let user_id = user._id;
        Reply.getRepliesByAuthorId(user_id, opt, (err, replies) => {
            return res.render('user-replys', {
                title: "个人中心",
                layout: 'indexTemplate',
                resource: mapping.user,
                user: user,
                replies: replies
            })
        })
    })
}

exports.usersPage = (req, res, next) => {

    let limit = 10;
    let page = req.params.page;
    let skip = (page - 1) * limit;
    User.getUserPage(limit, skip, (err, users) => {
        if (err) {
            return res.end(err);
        }
        return res.render('user-page', {
            title: '用户列表',
            layout: '',
            users: users
        })
    })
}
