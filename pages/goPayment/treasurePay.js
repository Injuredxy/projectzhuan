const app = getApp()
const netWorkComm = require("../../utils/network.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    vest: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    let price = options.new_price
    console.log(price)
    // 小数点前
    let one_price = price.substring(0, price.indexOf("."))
    // 小数点及小数点后
    let two_price = price.indexOf(".")
    this.setData({
      options,
      one_price,
      two_price,
      token: wx.getStorageSync('token')
    })
  },

  // 立即支付
  toPay(e) {
    const that = this
    let buy_type = that.data.options.buy_type
    if (app.globalData.but) {
      netWorkComm.netWork({
        url: "payment_modular/CommonPay/pay",
        method: 'POST',
        para: {
          order_sn: that.data.options.order_sn ? that.data.options.order_sn : that.data.order_sn,
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
              if (buy_type == '1') {
                wx.redirectTo({
                  url: `/pages/goAssemble/direct?id=${that.data.options.id}`,
                })
                app.getList()
              } else if (buy_type == '2') {
                wx.redirectTo({
                  url: `/pages/goPayment/help?activity_id=${that.data.options.activity_id}&order_sn=${that.data.options.order_sn}`,
                })
              } else if (buy_type == '3') {
                wx.redirectTo({
                  url: `/pages/goAssemble/groubInfo?order_sn=${that.data.options.order_sn}&record_id=${that.data.options.record_id}&id=${that.data.options.id}&is_check=${1}`,
                })
              } else if (buy_type == '4') {
                wx.redirectTo({
                  url: `/pages/goSample/details?order_sn=${that.data.options.order_sn}`,
                })
              } else if (buy_type == '5') {
                wx.navigateBack({
                  delta: 1
                })
              } else if (buy_type == '6') {
                wx.navigateBack({
                  delta: 1
                })
              }
            },
            fail(err) {
              if (buy_type == '1') {
                wx.redirectTo({
                  url: `/pages/goAssemble/direct?id=${that.data.options.id}`,
                })
              } else {
                wx.showToast({
                  title: '支付取消',
                  icon: 'none'
                })
              }
            }
          })
        }
      })
    }
    app.butPay()
  },

  // 绑定手机号
  getPhoneNumber(e) {
    const that = this
    console.log('水水水水')
    console.log(wx.getStorageSync('share_number'))
    if (e.detail.iv) {
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
          console.log('我要参团绑定')
          console.log(res)
          wx.setStorageSync('token', res.data.msg.token)
          that.setData({
            token: wx.getStorageSync('token')
          })
          if (res.data.status == 'success') {
            netWorkComm.netWork({
              url: 'group_buy_modular/ActivityGroupBuyOrder/joinGroupBuy',
              para: {
                group_buy_record_id: that.data.options.record_id,
                invitation_type: wx.getStorageSync('invitation_type'),
                parent_id: wx.getStorageSync('parent_id'),
                register_scene: wx.getStorageSync('register_scene'),
                share_number: wx.getStorageSync('share_number'),
                from_order_sn: wx.getStorageSync('from_order_sn'),
              },
              success(res) {
                console.log('我要参团')
                console.log(res)
                if (res.data.code == '61005') {
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
                      order_sn: order_sn,
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
                          wx.navigateBack({
                            delta: 1
                          })
                        },
                        fail(err) {
                          wx.showToast({
                            title: '支付取消',
                            icon: 'none'
                          })
                        }
                      })
                    }
                  })
                }
              }
            })
          }
        }
      })
    } else {
      wx.showToast({
        title: '未绑定手机号',
        icon: 'none'
      })
    }
  },

  goAll(){
    this.setData({
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
    this.setData({
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
    const that = this
    let buy_type = that.data.options.buy_type
    if (buy_type == '1') {
      wx.redirectTo({
        url: `/pages/goAssemble/direct?id=${that.data.options.id}`,
      })
    }
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