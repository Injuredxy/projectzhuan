var time = require('../../utils/util.js')
const app = getApp()
const netWorkComm = require("../../utils/network.js")
let SocketTask
const Config = require('../../utils/config.js')


Page({

  /**
   * 页面的初始数据
   */
  data: {
    cancel: false,
    refund: false,
    show: false,
    showView: false,
    timeOut: '',
    codeLayer: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this
    wx.showLoading({
      title: '正在加载...',
    })
    that.setData({
      options
    })
    wx.getSystemInfo({
      success: function (res) {
        let modelX = res.model.indexOf("iPhone X")
        that.setData({
          modelX
        })
      },
    })
  },

  goHomeData() {
    const that = this
    netWorkComm.netWork({
      url: 'payment_modular/CommonPay/getOrderInfo',
      para: {
        order_id: that.data.options.id,
        is_check: '1'
      },
      success(res) {
        console.log('直购',res)
        that.setData({
          fabulous: res.data.data,
          is_pay: res.data.data.order_info.is_pay,
          is_close: res.data.data.order_info.is_close,
          exchange: res.data.data.order_info.exchange_code_status,
          is_fund: res.data.data.order_info.is_fund,
          has_pay_time: res.data.data.order_info.has_pay_time,
          order_status: res.data.data.order_info.order_status,
          exchange_time: res.data.data.order_info.exchange_code_end_time_difference,
          show: true,
        }, () => {
          wx.hideLoading()
          wx.setStorageSync('from_order_sn', that.data.fabulous.order_info.order_id ? that.data.fabulous.order_info.order_id : '')
          that.countDown()
        })
      }
    })
  },

  // 倒计时
  countDown(time) {
    const that = this
    if (that.data.exchange_time > 0) {
      let countDownNum = that.data.exchange_time
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
    } else {
      let countDownNum = that.data.has_pay_time
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
    }
  },

  // 滚动穿透
  preventMove() {
    return
  },

  // 立即评价
  goComment() {
    let id = this.data.fabulous.order_info.order_id
    let activity_id = this.data.fabulous.goods.activity_id
    let price = this.data.fabulous.direct_price
    let name = this.data.fabulous.goods.product_name
    let img_url = this.data.fabulous.goods.product_img["0"].url
    let type = "group_buy_direct"
    wx.navigateTo({
      url: `/pages/goAssemble/comment?order_id=${id}&price=${price}&name=${name}&img_url=${img_url}&type=${type}&activity_id=${activity_id}`,
    })
  },

  // 买
  goShop() {
    let activity_id = this.data.fabulous.goods.activity_id
    wx.navigateTo({
      url: `/pages/details/assemble?activity_id=${activity_id}`,
    })
  },

  // 去商铺
  goStore() {
    let store_id = this.data.fabulous.store.id
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/goStore/index?store_id=${store_id}`,
      })
    }
    app.but()
  },

  // 打电话
  goIphon() {
    const that = this
    wx.makePhoneCall({
      phoneNumber: that.data.fabulous.store.mobile
    })
  },

  webSocket(e) {
    const that = this
    if(app.globalData.but) {
      let id = that.data.fabulous.order_info.order_id
      netWorkComm.netWork({
        url: 'payment_modular/CommonPay/getOrderExchangeCode',
        para: {
          order_id: id,
        },
        success(res) {
          console.log(res)
          if (res.data.status == 'success') {
            let code_image = wx.arrayBufferToBase64(wx.base64ToArrayBuffer(res.data.data.qrcode))
            let code_image1 = "data:image/png;base64," + code_image
            that.setData({
              code_image: code_image1
            })
            wx.onUserCaptureScreen(function (res) {
              that.setData({
                codeLayer: true
              })
            })
          }
        }
      })
    }
    app.but()
  },

  goLayer() {
    this.setData({
      codeLayer: false
    })
  },

  // 无效点击
  goClick() {
    return
  },

  // 关闭
  goAll() {
    this.setData({
      refund: false,
      cancel: false,
      codeLayer: false,
      code_image: ''
    })
  },

  // 未支付时去支付
  goBuy() {
    const that = this
    let order_sn = that.data.fabulous.order_info.order_sn
    let name = that.data.fabulous.goods.product_name
    let price = that.data.fabulous.order_info.actual_price
    let activity_id = that.data.fabulous.goods.activity_id
    let id = that.data.fabulous.order_info.order_id
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/goPayment/treasurePay?activity_id=${activity_id}&order_sn=${order_sn}&new_price=${price}&product_name=${name}&buy_type=${5}&id=${id}`,
      })
    }
    app.but()
  },

  // 取消订单
  goCancel() {
    this.setData({
      cancel: true,
      showView: true
    })
  },

  // 退款
  goRefund() {
    this.setData({
      refund: true,
      showView: true
    })
  },

  // 退款原因
  goRefundText() {
    const that = this
    let id = that.data.options.id
    let value = that.data.value
    if (app.globalData.but) {
      if (value) {
        netWorkComm.netWork({
          url: 'payment_modular/CommonPay/refundOrder',
          method: 'POST',
          para: {
            order_id: id,
            refund_reason: value,
          },
          success(res) {
            if (res.data.status == 'success') {
              wx.redirectTo({
                url: `/pages/goAssemble/refund?&id=${id}&type=${'direct'}`,
              })
              that.setData({
                refund: false
              })
            }
          }
        })
      } else {
        wx.showToast({
          title: '请填写退款原因',
          icon: 'none'
        })
      }
    }
    app.but()
  },

  // 提交原因
  goCancelText() {
    const that = this
    let id = that.data.fabulous.order_info.order_id
    let value = that.data.value
    if (value) {
      netWorkComm.netWork({
        url: 'payment_modular/CommonPay/closeOrder',
        method: 'POST',
        para: {
          order_id: id,
          close_reason: that.data.value,
        },
        success(res) {
          that.goHomeData()
          that.setData({
            cancel: false
          })
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      })
    } else {
      wx.showToast({
        title: '请填写取消原因',
        icon: 'none'
      })
    }
  },

  //查看更多商品
  goAssemble() {
    wx.navigateTo({
      url: '/pages/index/assemble',
    })
  },

  // input 获取信息
  textInput(e) {
    this.setData({
      value: e.detail.value
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.goHomeData()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    app.globalData.but = true
    clearInterval(this.data.timeOut)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.data.timeOut)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  }
})