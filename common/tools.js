
// 日期格式化的插件日引入
const moment = require('moment');
moment.locale('zh-cn') // 中文
exports.formatDate = (date, friendly) => {
    date = moment(date)
    if (friendly) {
       return  date.fromNow();
    } else {
        return date.format('YYYY-MM-DD HH:mm')
    }
}