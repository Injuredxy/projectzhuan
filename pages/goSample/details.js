var time = require('../../utils/util.js')
const netWorkComm = require("../../utils/network.js")
const app = getApp()
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
    exchangeStatus: false,
    codeLayer: false,
    timeOut: '',
    codeTime: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const that = this
    wx.showLoading({
      title: '正在加载...',
    })
    wx.getSystemInfo({
      success: function(res) {
        let modelX = res.model.indexOf("iPhone X")
        that.setData({
          modelX
        })
      },
    })
    that.setData({
      options
    })
  },

  getHomeData() {
    const that = this
    netWorkComm.netWork({
      url: 'sample_modular/SampleOrder/orderInfo',
      method: 'POST',
      para: {
        order_sn: that.data.options.order_sn,
        is_check: '1'
      },
      success(res) {
        console.log('清样', res)
        that.setData({
          fabulous: res.data.data,
          exchange: res.data.data.order_info.exchange_code_status,
          order_status: res.data.data.order_info.order_status,
          exchange_time: res.data.data.order_info.exchange_code_end_time_difference,
          show: true
        }, () => {
          wx.hideLoading()
          that.countDown()
        })
      }
    })
  },

  // 完成任务
  goTask() {
    const that = this
    netWorkComm.netWork({
      url: 'spike_modular/Task/receiveReward',
      method: 'POST',
      para: {
        task_id: 16
      },
      success(res) {
        that.setData({
          exchangeStatus: false,
        })
      }
    })
  },

  // 滚动穿透
  preventMove() {
    return
  },

  // 立即评价
  goComment() {
    let id = this.data.fabulous.order_info.id
    let activity_id = this.data.fabulous.goods.activity_id
    let price = this.data.fabulous.group_buy_price
    let name = this.data.fabulous.goods.product_name
    let img_url = this.data.fabulous.goods.product_img["0"].url
    let type = "sample"
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/goAssemble/comment?order_id=${id}&price=${price}&name=${name}&img_url=${img_url}&type=${type}&activity_id=${activity_id}`,
      })
    }
    app.but()
  },

  toRefund() {
    let order_sn = this.data.fabulous.order_info.order_sn
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/goAssemble/refund?order_sn=${order_sn}&type=${'sample'}`,
      })
    }
    app.but()
  },

  // 买
  goShop() {
    let activity_id = this.data.fabulous.goods.activity_id
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/details/sample?activity_id=${activity_id}`,
      })
    }
    app.but()
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
    if (app.globalData.but) {
      wx.makePhoneCall({
        phoneNumber: that.data.fabulous.store.mobile
      })
    }
    app.but()
  },

  webSocket(e) {
    const that = this
    if (app.globalData.but) {
      let id = that.data.fabulous.order_info.id
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
            wx.onUserCaptureScreen(function(res) {
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
    wx.redirectTo({
      url: `/pages/goPayment/treasurePay?activity_id=${activity_id}&order_sn=${order_sn}&new_price=${price}&product_name=${name}&buy_type=${1}&id=${id}`,
    })
  },

  // 取消订单
  goCancel() {
    this.setData({
      cancel: true
    })
  },

  // 退款
  goRefund() {
    this.setData({
      refund: true
    })
  },

  // 退款原因
  goRefundText() {
    const that = this
    let id = that.data.fabulous.order_info.id
    let value = that.data.value
    let order_sn = that.data.fabulous.order_info.order_sn
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
              that.setData({
                refund: false
              })
              wx.redirectTo({
                url: `/pages/goAssemble/refund?order_sn=${order_sn}&type=${'sample'}`,
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

  // 倒计时
  countDown(time) {
    const that = this
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
  },

  //查看更多商品
  goAssemble() {
    if (app.globalData.but) {
      wx.navigateTo({
        url: '/pages/index/sample',
      })
    }
    app.but()
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
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    const that = this
    if (wx.getStorageSync('sampleStatus') == 'done') {
      that.setData({
        spikeStatus: false
      })
    } else {
      that.setData({
        spikeStatus: true
      })
    }
    that.getHomeData()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    app.globalData.but = true
    clearInterval(this.data.timeOut)
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