const Config = require('./config.js')
const app = getApp()


function but() {
  app.globalData.but = false
  console.log(1)
}

// 域名wep
function netWork(obj) {
  //obj.para处理加密
  // if (obj.auth){
  // }
  // console.log("正在请求" + obj.url)
  // console.log("请求参数" + obj.para)
  wx.request({
    url: Config.BaseUrl + obj.url,
    data: obj.para || {},
    header: {
      "content-type": obj.contentType || obj.method == 'POST' ? 'application/x-www-form-urlencoded' : 'application/json',
      "app": "Mini",
      "token": wx.getStorageSync('token')
    },
    method: obj.method || 'GET',
    dataType: 'json',
    responseType: 'text',
    success: function(res) {
      if (typeof obj.success === "function") {
        obj.success(res)
      }
      if (res.data.status === 'fail' && res.data.code != '61002' && res.data.code != '61004' && res.data.code != '61005' && res.data.code != '60007') {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    },
    // fail: function(err) {
    //   wx.showToast({
    //     title: "您的网络不给力",
    //     icon: "none",
    //     duration: 2000
    //   })
    //   if (typeof obj.fail === "function") {
    //     obj.fail(err)
    //   }
    // },
    complete: function(res) {
      if (typeof obj.complete === "function") {
        obj.complete(res)
      }

    }
  })
}

// m=>km转换
function tDistance(d) {
  d = Number(d)
  if (d >= 1000) {
    return parseInt(d / 1000) + 'km'
  } else {
    return parseInt(d) + 'm'
  }
}

module.exports = {
  netWork,
  tDistance,
  but
}