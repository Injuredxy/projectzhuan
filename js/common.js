module.exports = {
  data: {
    token: wx.getStorageSync('token'),
    web: 'https://wap.zhuangxiumall.cn/',
    domain: 'https://test.zhuangxiumall.cn/'
  },
  wxRequest: function (e) {
    const that = this
    var header = {
      app: 'Mini'
    }
    if (!e.extra || !e.extra.notoken) {
      var token = e && e.extra && e.extra.token ? e.extra.token : ''
      if (token) {
        if (token == 'tourist') {
          if (this.data.token) {
            header.token = this.data.token
          }
        } else {
          header.token = token
        }
      } else {
        header.token = this.data.token
      }
      if (!getApp().data.userInfo && token != 'tourist') {
        if (!this.data.token) {
          e && e.notoken && e.notoken()
        }
        return
      }
    }
    wx.request({
      url: this.data.domain + e.url,
      method: e.method || 'GET',
      header: header,
      data: e.data,
      success: function (res) {
        if (that.checkError(res.data)) {
          e && e.success && e.success(res)
        }
      },
      fail: function (res) {
        e && e.fail && e.fail(res)
      },
      complete: function (res) {
        e && e.complete && e.complete(res)
      }
    })
  },
  checkError: function (res) {
    const that = this
    if (res.status == 'success') {
      return true
    } else if (res.status == 'fail') {
      switch (res.msg) {
        case 'Wrong number of segments':
          that.login()
          break
        default:
          wx.showToast({
            icon: 'none',
            title: res.msg,
          })
      }
    }
  },
  login: function (e) {
    const that = this
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo'] && that.data.token) {
          wx.showLoading({ mask: true, title: '登录中...' })
          wx.login({
            success: function (res) {
              that.wxRequest({
                url: 'user/ThreeUser/miniLoginByCode',
                method: 'POST',
                data: {
                  code: res.code
                },
                extra: {
                  notoken: true
                },
                success: function (res) {
                  if (res.data.data.user) {
                    getApp().data.userInfo = res.data.data.user
                    that.data.token = res.data.data.user.token
                    e && e.success && e.success()

                    var pages = getCurrentPages()
                    pages[pages.length - 1].reload && pages[pages.length - 1].reload()
                  }
                },
                complete: function (res) {
                  wx.hideLoading()
                }
              })
            }
          })
        } else if (e.jump) {
          wx.navigateTo({
            url: '/pages/login/login'
          })
        }
      }
    })
  },
  tranTime: function (timestamp) {
    var time = new Date(timestamp * 1000)
    var Y = time.getFullYear()
    var M = (time.getMonth() + 1 < 10 ? '0' + (time.getMonth() + 1) : time.getMonth() + 1)
    var D = (time.getDate() < 10 ? '0' + (time.getDate()) : time.getDate())
    var h = (time.getHours() < 10 ? '0' + time.getHours() : time.getHours())
    var m = (time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes())
    var s = (time.getSeconds() < 10 ? '0' + time.getSeconds() : time.getSeconds())

    return (Y + '-' + M + '-' + D + ' ' + h + ':' + m)
  }
}