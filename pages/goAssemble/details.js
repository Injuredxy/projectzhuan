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
    show: false,
    codeLayer: false,
    comment: false,
    showView: false,
    exchangeStatus: false,
    share: false,
    codeLayer: false,
    timeOut: '',
    vest: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const that = this
    that.setData({
      options
    })
    that.getInfo()
    console.log('拼团分享码')
    console.log(wx.getStorageSync('share_number'))
  },

  getHomeData() {
    const that = this
    that.setData({
      token: wx.getStorageSync('token')
    })
    wx.showLoading({
      title: '正在加载...',
    })
    netWorkComm.netWork({
      url: 'group_buy_modular/ActivityGroupBuyOrder/getGroupBuyRecord',
      para: {
        group_buy_record_id: that.data.options.record_id,
        is_check: that.data.options.is_check
      },
      success(res) {
        if (res.data.msg == '拼团已关闭') {
          that.setData({
            failMsg: true
          })
        } else {
          console.log('拼团详情')
          console.log(res)
          let order_status = res.data.data.status
          let in_order = res.data.data.in_order
          if (res.data.data.activity_group_buy_order) {
            let exchange_code = res.data.data.activity_group_buy_order.exchange_code
            let exchange_code1 = exchange_code.replace(/(.{4})/g, "$1 ")
            that.setData({
              order_status: res.data.data.activity_group_buy_order.order_status,
              activity_group_buy_order: res.data.data.activity_group_buy_order,
              exchange: res.data.data.activity_group_buy_order.exchange_code_status,
              exchange_time: res.data.data.activity_group_buy_order.exchange_code_end_time_difference,
              exchange_code1
            })
            console.log(res.data.data.activity_group_buy_order)
          }
          let nice = res.data.data.users.filter((item, index) => {
            return (index == 0)
          })
          // 小数点及小数点后
          let two_price = res.data.data.activity_group_buy.group_buy_price.indexOf(".")
          console.log(two_price)
          that.setData({
            nice,
            two_price,
            fabulous: res.data.data,
            time: res.data.data.difference_time,
            in_order: res.data.data.in_order,
            status: res.data.data.status,
            code1: res.data.code,
            share_order_sn: res.data.data.share_order_sn,
            show: true
          }, () => {
            that.countDown()
          })
          wx.hideLoading()
        }
      }
    })
    wx.stopPullDownRefresh()
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

  // 完成任务
  goTask() {
    const that = this
    netWorkComm.netWork({
      url: 'spike_modular/Task/receiveReward',
      method: 'POST',
      para: {
        task_id: 15
      },
      success(res) {
        that.setData({
          exchangeStatus: false,
        })
      }
    })
  },

  goExchange() {
    const that = this
    that.setData({
      codeLayer: false
    })
    SocketTask.close()
    netWorkComm.netWork({
      url: 'spike_modular/Task/getList',
      method: 'POST',
      success(res) {
        netWorkComm.netWork({
          url: 'group_buy_modular/ActivityGroupBuyOrder/getGroupBuyRecord',
          para: {
            group_buy_record_id: that.data.options.record_id,
            is_check: that.data.options.is_check
          },
          success(res) {
            that.setData({
              order_status: res.data.data.activity_group_buy_order.order_status,
              exchange: res.data.data.activity_group_buy_order.exchange_code_status
            })
          }
        })
        let code15 = res.data.data.list.filter((item, index) => {
          return (item.id == 15)
        })
        console.log('code13')
        let spikeStatus = code15[0].status
        if (spikeStatus == 2) {
          that.setData({
            exchangeStatus: true
          })
          wx.setStorageSync('groupStatus', 'done')
        }
      }
    })
  },

  // 无效点击
  goClick() {
    return
  },

  // 关闭所有
  goAll() {
    this.setData({
      cancel: false,
      share: false,
      vest: false,
      codeLayer: false,
      code_image: ''
    })
  },

  webSocket(e) {
    const that = this
    if (app.globalData.but) {
      let id = that.data.fabulous.activity_group_buy_order.id
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

  // 滚动穿透
  preventMove() {
    return
  },

  // 立即评价
  goComment() {
    let id = this.data.fabulous.activity_group_buy_order.id
    let activity_id = this.data.fabulous.group_buy_id
    let price = this.data.fabulous.activity_group_buy_order.price
    let name = this.data.fabulous.activity_group_buy.goods.product_name
    let img_url = this.data.fabulous.activity_group_buy.goods.img_url
    let type = "group_buy"
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/goAssemble/comment?order_id=${id}&price=${price}&name=${name}&img_url=${img_url}&type=${type}&activity_id=${activity_id}`,
      })
    }
    app.but()
  },

  // 买
  goShop() {
    let activity_id = this.data.fabulous.activity_group_buy.activity_id
    console.log(activity_id)
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/details/assemble?activity_id=${activity_id}`
      })
    }
    app.but()
  },

  // 商家信息
  goStore() {
    let store_id = this.data.fabulous.store.id
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/goStore/index?store_id=${store_id}`
      })
    }
    app.but()
  },

  // 电话
  goIphon() {
    const that = this
    wx.makePhoneCall({
      phoneNumber: that.data.fabulous.store.mobile
    })
  },

  // 查看退款详情
  goRefund() {
    let record_id = this.data.options.record_id
    let id = this.data.options.id
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/goAssemble/refund?record_id=${record_id}&type=${'group'}`
      })
    }
    app.but()
  },

  // 退款
  goCancel() {
    this.setData({
      cancel: true,
      showView: true
    })
  },

  //获取文本内容
  textInput(e) {
    this.setData({
      value: e.detail.value
    })
  },

  // 退款原因
  goCancelText() {
    const that = this
    let id = that.data.fabulous.activity_group_buy_order.id
    let value = that.data.value
    let record_id = that.data.options.record_id
    if (app.globalData.but) {
      if (value) {
        netWorkComm.netWork({
          url: 'payment_modular/CommonPay/refundOrder',
          method: 'POST',
          para: {
            order_id: id,
            refund_reason: value
          },
          success(res) {
            console.log('拼团退款')
            console.log(res)
            if (res.data.status == 'success') {
              that.setData({
                cancel: false
              })
              wx.redirectTo({
                url: `/pages/goAssemble/refund?record_id=${record_id}&is_check=${'1'}&type=${'group'}`,
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

  getInfo() {
    const that = this
    wx.getSystemInfo({
      success: function(res) {
        console.log(res)
        let pixe = res.windowWidth / 375
        let myCanvasWidth = res.windowWidth
        let myCanvasHeight = myCanvasWidth * 4 / 5
        let modelX = res.model.indexOf("iPhone X")
        that.setData({
          canvasWidth: myCanvasWidth,
          canvasHeight: myCanvasHeight,
          pixe,
          modelX
        })
      },
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
    that.getHomeData()
    that.setData({
      token: wx.getStorageSync('token')
    })
    if (wx.getStorageSync('groupStatus') == 'done') {
      that.setData({
        spikeStatus: false
      })
    } else {
      that.setData({
        spikeStatus: true
      })
    }
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
    this.getHomeData()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    console.log('拼团分享码')
    console.log(wx.getStorageSync('from_order_sn'))
    console.log(wx.getStorageSync('share_number'))
  }
})