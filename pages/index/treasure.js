const app = getApp()
const util = require('../../utils/util.js')
const netWorkComm = require("../../utils/network.js")

Page({
  data: {
    imageText: [{
        'name': '获得资格',
      },
      {
        'name': '1分开砍',
      },
      {
        'name': '8刀砍成',
      },
      {
        'name': '到店兑换'
      }
    ],
    treasure: {
      list: []
    },
    userInfo: '1',
    task: false,
    p: 1,
    token: wx.getStorageSync('token')
  },

  onLoad: function() {
    const that = this
    that.goTreasureData()
    wx.hideTabBar()
    that.getInfo()
  },

  onShow() {
    const that = this
    that.setData({
      token: wx.getStorageSync('token')
    })
    if (wx.getStorageSync('token')) {
      netWorkComm.netWork({
        url: 'user/User/getTreasure',
        method: "POST",
        success(res) {
          console.log(res.data.data)
          that.setData({
            getCount: res.data.data,
            token: wx.getStorageSync('token')
          })
        }
      })
    }
  },

  // 免费领
  goTreasureData() {
    const that = this
    //免费领列表
    wx.showLoading({
      title: '正在加载...',
    })
    netWorkComm.netWork({
      url: 'spike_modular/Home/getSpikeListV1',
      method: 'POST',
      para: {
        lat: wx.getStorageSync('lat'),
        lng: wx.getStorageSync('lng'),
        p: 1
      },
      success: function(res) {
        console.log(res.data.data)
        that.setData({
          p: 1,
          'treasure.list': res.data.data,
        })
        wx.hideLoading()
      }
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

  // 无效点击
  goClick() {
    return
  },

  // 关闭
  goAll() {
    this.setData({
      task: false,
    })
  },

  // 滚动穿透
  preventMove() {
    return
  },

  // 去免费领
  toTreasure: function(e) {
    let activity_id = this.data.treasure.list[e.currentTarget.dataset.index].activity_id
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/details/treasure?activity_id=${activity_id}`
      })
    }
    app.but()
  },

  // 去赚次数
  goTimes() {
    const that = this
    if (app.globalData.but) {
      that.setData({
        task: false
      })
      wx.navigateTo({
        url: '/pages/goPayment/core',
      })
    }
    app.but()
  },

  onHide() {
    app.globalData.but = true
  },

  // 授权登录
  bindgetuserinfo(e) {
    const that = this
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
                let openId = res.data.data.three_user.openId
                let unionId = res.data.data.three_user.unionId
                let head_pic = res.data.data.three_user.avatarUrl
                let nickName = res.data.data.three_user.nickName
                wx.navigateTo({
                  url: `/pages/goPayment/core?openId=${openId}&unionId=${unionId}&head_pic=${head_pic}&nickName=${nickName}`,
                })
                that.setData({
                  login: false
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

  onReady() {
    this.setData({
      show: true
    })
  },

  // 上拉加载
  onPullDownRefresh() {
    const that = this
    //免费领列表
    wx.showLoading({
      title: '正在加载...',
    })
    netWorkComm.netWork({
      url: 'spike_modular/Home/getSpikeListV1',
      method: 'POST',
      para: {
        lat: wx.getStorageSync('lat'),
        lng: wx.getStorageSync('lng'),
        p: 1
      },
      success: function(res) {
        console.log(res.data.data)
        that.setData({
          p: 1,
          'treasure.list': res.data.data,
        })
        wx.hideLoading()
        wx.stopPullDownRefresh()
      }
    })
  },

  // goBottom() {
  //   const that = this
  //   console.log(1)
  //   //免费领列表
  //   netWorkComm.netWork({
  //     url: 'spike_modular/Home/getSpikeListV1',
  //     method: 'POST',
  //     para: {
  //       lat: wx.getStorageSync('lat'),
  //       lng: wx.getStorageSync('lng'),
  //       p: that.data.p + 1
  //     },
  //     success: function (res) {
  //       if (res.data.data) {
  //         console.log(res.data.data)
  //         let list = that.data.treasure.list.concat(res.data.data)
  //         console.log(list)
  //         that.setData({
  //           p: that.data.p + 1,
  //           'treasure.list': list
  //         })
  //       }
  //     }
  //   })
  // },

  // 下拉加载
  onReachBottom() {
    const that = this
    //免费领列表
    netWorkComm.netWork({
      url: 'spike_modular/Home/getSpikeListV1',
      method: 'POST',
      para: {
        lat: wx.getStorageSync('lat'),
        lng: wx.getStorageSync('lng'),
        p: that.data.p + 1
      },
      success: function(res) {
        if (res.data.data) {
          let list = that.data.treasure.list.concat(res.data.data)
          console.log(list)
          that.setData({
            p: that.data.p + 1,
            'treasure.list': list
          })
        }
      }
    })
  }
})