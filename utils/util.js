const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/** 
 * 时间戳转化为年 月 日 时 分 秒 
 * number: 传入时间戳 
 * format：返回格式，支持自定义，但参数必须与formateArr里保持一致 
 */
function formatTimeTwo(number, format) {

  var formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
  var returnArr = [];

  var date = new Date(number * 1000);
  returnArr.push(date.getFullYear());
  returnArr.push(formatNumber(date.getMonth() + 1));
  returnArr.push(formatNumber(date.getDate()));

  returnArr.push(formatNumber(date.getHours()));
  returnArr.push(formatNumber(date.getMinutes()));
  returnArr.push(formatNumber(date.getSeconds()));

  for (var i in returnArr) {
    format = format.replace(formateArr[i], returnArr[i]);
  }
  return format;
}

function onShareAppMessage(title, path, callback, imageUrl) {
  //设置一个默认分享背景图片
  let defaultImageUrl = '';
  return {
    title: title,
    path: path,
    imageUrl: imageUrl || defaultImageUrl,
    success(res) {
      console.log("转发成功！");
      if (!res.shareTickets) {
        //分享到个人
        api.shareFriend().then(() => {
          console.warn("shareFriendSuccess!");
          //执行转发成功以后的回调函数
          callback && callback();
        });
      } else {
        //分享到群
        let st = res.shareTickets[0];
        wx.getShareInfo({
          shareTicket: st,
          success(res) {
            let iv = res.iv
            let encryptedData = res.encryptedData;
            api.groupShare(encryptedData, iv).then(() => {
              console.warn("groupShareSuccess!");
              //执行转发成功以后的回调函数
              callback && callback();
            });
          }
        });
      }
    },
    fail: function(res) {
      console.log("转发失败！");
    }
  };
}

function time(time) {
  let date = time;
  date = date.substring(0, 19);
  date = date.replace(/-/g, '/');
  let timestamp = new Date(date).getTime();
  console.log(timestamp);
}

module.exports = {
  formatTime: formatTime,
  formatTimeTwo: formatTimeTwo,
  onShareAppMessage: onShareAppMessage,
  time: time
}