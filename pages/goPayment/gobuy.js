const netWorkComm = require("../../utils/network.js")
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    play: false,
    token: wx.getStorageSync('token'),
    refuse: false,
    timeOut: '',
    vest: false,
    vest_status: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const that = this
    that.setData({
      options
    })
    if (options.order_sn) {
      that.setData({
        order_sn: options.order_sn
      })
    }
    that.countDown()
    if (wx.getStorageSync('token')) {
      netWorkComm.netWork({
        url: "spike_modular/SpikeOrder/addOrder",
        method: 'POST',
        para: {
          activity_id: options.id,
          invitation_type: wx.getStorageSync('invitation_type'),
          parent_id: wx.getStorageSync('parent_id'),
          register_scene: wx.getStorageSync('register_scene'),
          share_number: wx.getStorageSync('share_number'),
          from_order_sn: wx.getStorageSync('from_order_sn'),
        },
        success(res) {
          if (res.data.code == '60007') {
            that.setData({
              vest_status: true
            })
          } else {
            that.setData({
              order_sn: res.data.data.order_sn
            })
          }
        }
      })
    }
  },

  // 返回
  goReturn() {
    wx.navigateBack({
      delta: 1
    })
  },

  // 倒计时
  countDown() {
    const that = this
    let countDownNum = 21600
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

  // 绑定手机号
  getPhoneNumber(e) {
    const that = this
    if (e.detail.iv) {
      let activity_id = that.data.options.id
      netWorkComm.netWork({
        url: 'user/ThreeUser/miniBind',
        method: 'POST',
        para: {
          open_id: that.data.options.openId,
          union_id: that.data.options.unionId,
          ot: 'wx',
          head_pic: that.data.options.head_pic,
          nickname: that.data.options.nickName,
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv,
          invitation_type: wx.getStorageSync('invitation_type'),
          parent_id: wx.getStorageSync('parent_id'),
          register_scene: wx.getStorageSync('register_scene'),
          share_number: wx.getStorageSync('share_number'),
          from_order_sn: wx.getStorageSync('from_order_sn'),
        },
        success(res) {
          wx.setStorageSync('token', res.data.msg.token)
          that.setData({
            token: wx.getStorageSync('token')
          })
          netWorkComm.netWork({
            url: "spike_modular/SpikeOrder/addOrder",
            method: 'POST',
            para: {
              activity_id,
              invitation_type: wx.getStorageSync('invitation_type'),
              parent_id: wx.getStorageSync('parent_id'),
              register_scene: wx.getStorageSync('register_scene'),
              share_number: wx.getStorageSync('share_number'),
              from_order_sn: wx.getStorageSync('from_order_sn'),
            },
            success(res) {
              console.log(res)
              if (res.data.code == '60007') {
                that.setData({
                  vest: true
                })
              } else {
                let order_sn = res.data.data.order_sn
                that.setData({
                  order_sn
                })
                netWorkComm.netWork({
                  url: "payment_modular/CommonPay/pay",
                  method: 'POST',
                  para: {
                    order_sn,
                    pay_type: '1'
                  },
                  success(res) {
                    console.log(res)
                    let pay = JSON.parse(res.data.data)
                    wx.requestPayment({
                      timeStamp: pay.timeStamp,
                      nonceStr: pay.nonceStr,
                      package: pay.package,
                      signType: pay.signType,
                      paySign: pay.paySign,
                      success(res) {
                        wx.redirectTo({
                          url: `/pages/goPayment/help?activity_id=${activity_id}&order_sn=${order_sn}`,
                        })
                        app.but()
                      },
                      fail(err) {
                        that.setData({
                          refuse: true
                        })
                      }
                    })
                  }
                })
              }
            },
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

  // 点击提交订单
  goBuy(e) {
    const that = this
    console.log('提交订单分享码')
    console.log(wx.getStorageSync('share_number'))
    if (app.globalData.but) {
      if (that.data.vest_status) {
        that.setData({
          vest: true
        })
      } else {
        netWorkComm.netWork({
          url: "payment_modular/CommonPay/pay",
          method: 'POST',
          para: {
            order_sn: that.data.order_sn,
            pay_type: '1'
          },
          success(res) {
            console.log(res)
            let pay = JSON.parse(res.data.data)
            wx.requestPayment({
              timeStamp: pay.timeStamp,
              nonceStr: pay.nonceStr,
              package: pay.package,
              signType: pay.signType,
              paySign: pay.paySign,
              success(res) {
                wx.redirectTo({
                  url: `/pages/goPayment/help?activity_id=${that.data.options.id}&order_sn=${that.data.order_sn}`,
                })
              },
              fail(err) {
                that.setData({
                  refuse: true
                })
              }
            })
          }
        })
      }
    }
    app.but()
  },

  // 滚动穿透
  preventMove() {
    return
  },

  goClick() {
    return
  },

  // 玩法介绍
  goPlay() {
    console.log(1)
    this.setData({
      play: true
    })
  },

  // 关闭
  goAll() {
    this.setData({
      code: false,
      play: false,
      refund: false,
      codes: false,
      refuse: false,
      vest: false
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    const that = this
    let progress_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAAA4CAMAAAALkqCbAAAAkFBMVEVHcEz6Uk74UU//AAD5Uk74Uk74Uk75U034Uk7/VVX5Uk74VU76Uk34U074Uk77UU3/VUT4Uk74Uk72VE/6Uk/5Uk78U0/5Uk31Tk75Uk/4U0z5U034Uk76UlD4UU34Uk7/VUr4U075Uk74Uk35Uk75UU7/VVX5U0//UFD4UE34Uk76Uk74UU74Uk/5UU74Uk76M9jyAAAAL3RSTlMAk7wC8o/UK/wG/iQ43vJCD4zpOmTfSnoaq01Tu2b++hiXy+r1Wwl4EEm9j/vTqZH6Zt8AAADVSURBVFjD7dhHDsJAEETRMk5jk3POOc79b4cxCAFm7WrJ/fcjvcVsuoCk0A88S8gL/BDPIsdYWsaJUkPJUis9FI4l5yT/wbARJoRv6fkI+IgAHh/hwQpIEYpQhCIUoQhFKEIRilCEIoqBEHEGijiIRUwDIkYSEXORjOFMxIQoY0z9Wyf7JB4j724ZxDJ3AxrVH8N1lz8ClfmXYROC0f4LMaUY4E4+DEOQWrTehu6BhcBx9jJc2uDVfCH6RAOiVWo4uUwEyrXEsB6A2za2pgd2o3MdhegOigwEhrWw0HYAAAAASUVORK5CYII="
    that.setData({
      progress_image,
      token: wx.getStorageSync('token'),
      orderLength: app.globalData.orderLength
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    app.globalData.but = true
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    clearInterval(this.data.timeOut)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  }
})