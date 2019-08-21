const Config = require('../../utils/config.js')
const {
  netWork
} = require("../../utils/network.js")
// const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scan_uri: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    this.setData({
      options
    })
    // this.setData({
    //   scan_uri: `${options.scan_uri}?version=${options.version}&share_number=${options.share_number}`
    // })
  },
  pay() {
    const that = this
    netWork({
      url: "/scan_modular/Scan/scanPay",
      method: "post",
      para: {
        pay_total_price: that.data.options.pay_total_price,
        store_id: that.data.options.store_id,
        pay_type: 1,
        remarks: "第一次扫码付",
        share_number: that.data.options.share_number,
      },
      success(res) {
        console.log('定单号', res)
        let para = JSON.parse(res.data.data.pay_param)
        console.log(JSON.parse(res.data.data.pay_param))
        console.log(JSON.parse(res.data.data.pay_param).nonceStr)
        let order_sn = res.data.data.order_sn
        let store_id = that.data.options.store_id
        wx.requestPayment({
          'timeStamp': para.timeStamp,
          'nonceStr': para.nonceStr,
          'package': para.package,
          'signType': para.signType,
          'paySign': para.paySign,
          success(res) {
            wx.redirectTo({
              url: `/pages/order/details?order_sn=${order_sn}`,
            })
          },
          fail(res) {
            console.log(res)
          },
          complete(res) {
            console.log(res)
          }
        })
      }
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

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

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