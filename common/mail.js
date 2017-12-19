
const nodemailer = require('nodemailer');
const setting = require('../setting');
const mail = {
    sendEmail: (type, regMsg, callback) => {
        let name = regMsg.name; // 要发送邮箱的的用户名
        let email = regMsg.email; // 要发送的邮箱的地址
        // 创建SMTP服务
        let transporter = nodemailer.createTransport({
            host: 'smtp.qq.com',
            auth: {
                user: setting.mail_opts.auth.user,
                pass: setting.mail_opts.auth.pass
            }
        })
        // 2.设置邮箱的默认格式
        let mailOptions = {
            from: `${setting.mail_opts.auth.user}`, //发送者的邮箱
            to: `${email}`, // 接收者的邮箱
            subject: `${email}恭喜您,注册社区系统已成功`, // 发送的主题
            text: `${name}你好`, // 发送的标题
            html: `<b>恭喜${name}您已经注册成功，请及时进行登录!</b>` // 发送的内容
        };
        //发送行为
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                callback(error);
            }
            callback(info);
        });
    }
}
module.exports = mail;