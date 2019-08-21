const app = getApp()
const netWorkComm = require("../../utils/network.js")

Page({
  data: {
    show: false,
    userInfo: '',
    timeOut: '',
    phone: false
  },

  onLoad: function() {
    const that = this
    wx.showLoading({
      title: '正在加载...',
    })
    wx.hideTabBar()
    that.getInfo()
    if (wx.getStorageSync('token')) {
      netWorkComm.netWork({
        url: 'user/User/userInfo',
        method: 'POST',
        success(res) {
          that.setData({
            userInfo: res.data.data,
            show: true
          })
          wx.hideLoading()
        }
      })
    } else {
      that.setData({
        show: true
      })
      wx.hideLoading()
    }
    that.setData({
      token: wx.getStorageSync('token')
    })
  },

  // 机型
  getInfo() {
    const that = this
    wx.getSystemInfo({
      success: function(res) {
        let modelX = res.model.indexOf("iPhone X")
        that.setData({
          modelX,
        })
      },
    })
  },

  // 滚动穿透
  preventMove() {
    return
  },

  // 评论
  goComment() {
    let comment_count = this.data.comment_count
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/user/comment?comment_count=${comment_count}`,
      })
    }
    app.but()
  },

  goOrder() {
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/order/order?current=${0}`,
      })
    }
    app.but()
  },

  goOrder1() {
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/order/order?current=${1}`,
      })
    }
    app.but()
  },

  goOrder2() {
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/order/order?current=${2}`,
      })
    }
    app.but()
  },

  goOrder3() {
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/order/order?current=${3}`,
      })
    }
    app.but()
  },

  goOrder4() {
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/order/order?current=${4}`,
      })
    }
    app.but()
  },

  getList() {
    const that = this
    netWorkComm.netWork({
      url: 'order_modular/OrderProgression/getProgressionOrder',
      method: "POST",
      success(res) {
        console.log('我的未完成', res)
        if (res.data.data) {
          let orderList1 = res.data.data[0]
          console.log(orderList1)
          that.setData({
            orderList: orderList1
          }, () => {
            that.countDown()
          })
        } else {
          that.setData({
            orderList: ''
          })
        }
      }
    })
  },

  goHelp(e) {
    if (app.globalData.but) {
      let item = this.data.orderList
      if (item.type == 'spike') {
        wx.navigateTo({
          url: `/pages/goPayment/help?order_sn=${item.data.order_sn}`,
        })
      } else if (item.type == "group_buy") {
        wx.navigateTo({
          url: `/pages/goAssemble/groubInfo?id=${item.data.user_order.id}&record_id=${item.data.user_order.record_id}`,
        })
      }
    }
    app.but()
  },

  // 倒计时
  countDown() {
    const that = this
    let countDownNum = that.data.orderList.data.difference_time
    that.setData({
      countDownNum
    })
    let timeOut = setInterval(() => {
      countDownNum--;
      that.setData({
        countDownNum
      })
      if (that.data.countDownNum == 0) {
        clearInterval(timeOut)
      }
    }, 1000)
    that.setData({
      timeOut
    })
  },

  onShow() {
    const that = this
    that.setData({
      token: wx.getStorageSync('token')
    })
    if (wx.getStorageSync('token')) {
      that.getList()
      netWorkComm.netWork({
        url: 'user/User/myCount',
        method: 'POST',
        success(res) {
          that.setData({
            collection_count: res.data.data.collection_count,
            comment_count: res.data.data.comment_count,
            concern_count: res.data.data.concern_count,
            message_count: res.data.data.message_count
          })
        }
      })
      netWorkComm.netWork({
        url: 'user/User/getUserOrderCount',
        method: 'POST',
        success(res) {
          console.log(res)
          that.setData({
            list_count: res.data.data
          })
        }
      })
      netWorkComm.netWork({
        url: 'user/User/userInfo',
        method: 'POST',
        success(res) {
          that.setData({
            userInfo: res.data.data,
            show: true
          })
          wx.hideLoading()
        }
      })
    } else {
      that.setData({
        collection_count: 0,
        comment_count: 0,
        concern_count: 0
      })
    }
  },

  onHide() {
    app.globalData.but = true
    clearInterval(this.data.timeOut)
  },

  // 授权登录
  bindgetuserinfo(e) {
    const that = this
    console.log(e)
    if (app.globalData.but) {
      if (e.detail.userInfo) {
        wx.login({
          success(res) {
            let code = res.code
            netWorkComm.netWork({
              url: 'user/ThreeUser/miniLogin',
              method: 'POST',
              para: {
                code: code,
                signature: e.detail.signature,
                rawData: e.detail.rawData,
                encryptedData: e.detail.encryptedData,
                iv: e.detail.iv
              },
              success(res) {
                console.log('我的绑定')
                console.log(res)
                let openId = res.data.data.three_user.openId
                let unionId = res.data.data.three_user.unionId
                let head_pic = res.data.data.three_user.avatarUrl
                let nickName = res.data.data.three_user.nickName
                wx.navigateTo({
                  url: `/pages/user/login?openId=${openId}&unionId=${unionId}&head_pic=${head_pic}&nickName=${nickName}`,
                })
              }
            })
          }
        })
      } else {
        wx.showToast({
          title: '未授权',
          icon: 'none'
        })
      }
    }
    app.but()
  },

  getPhoneNumber(e) {
    const that = this
    that.setData({
      phone: false
    })
    console.log(e)
    console.log('登录分享码')
    console.log(wx.getStorageSync('share_number'))
    if (e.detail.iv) {
      netWorkComm.netWork({
        url: 'user/ThreeUser/miniBind',
        method: 'POST',
        para: {
          open_id: that.data.openId,
          union_id: that.data.unionId,
          ot: 'wx',
          head_pic: that.data.head_pic,
          nickname: that.data.nickName,
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv,
          invitation_type: wx.getStorageSync('invitation_type'),
          parent_id: wx.getStorageSync('parent_id'),
          register_scene: wx.getStorageSync('register_scene'),
          share_number: wx.getStorageSync('share_number'),
          from_order_sn: wx.getStorageSync('from_order_sn'),
        },
        success(res) {
          console.log('success成功')
          console.log(res)
          wx.setStorageSync('token', res.data.msg.token)
          if (res.data.status == 'success') {
            wx.showToast({
              title: '登录成功',
              icon: 'none'
            })
          }
          that.setData({
            token: wx.getStorageSync('token'),
          })
          netWorkComm.netWork({
            url: 'user/User/userInfo',
            method: 'POST',
            success(res) {
              that.setData({
                userInfo: res.data.data
              })
            }
          })
        }
      })
    } else {
      wx.showToast({
        title: '未绑定手机号',
        icon: 'none'
      })
    }
  },

  goAll() {
    this.setData({
      phone: false
    })
  },

  goClick() {
    return
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    const that = this
    if (wx.getStorageSync('token')) {
      netWorkComm.netWork({
        url: 'user/User/userInfo',
        method: 'POST',
        success(res) {
          that.setData({
            userInfo: res.data.data,
            show: true
          })
          wx.stopPullDownRefresh()
        }
      })
    } else {
      that.setData({
        show: true
      })
      wx.stopPullDownRefresh()
    }
  },

})