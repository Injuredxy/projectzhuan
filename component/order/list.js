const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  // 查看订单
  goOrder() {
    if (app.globalData.but) {
      app.globalData.orderAll = 'false'
      this.setData({
        orderAll: 'false'
      })
      wx.navigateTo({
        url: `/pages/order/order?current=${0}`,
      })
    }
    app.but()
  },

  // 砍价
  goHelp(e) {
    if (app.globalData.but) {
      app.globalData.orderAll = 'false'
      this.setData({
        orderAll: 'false'
      })
      let item = e.currentTarget.dataset.item
      if (item.type == 'spike') {
        wx.navigateTo({
          url: `/pages/goPayment/help?order_sn=${item.order.order_sn}`,
        })
      } else if (item.type == "group_buy") {
        wx.navigateTo({
          url: `/pages/goAssemble/groubInfo?id=${item.order.id}&record_id=${item.order.record_id}`,
        })
      }
    }
    app.but()
  },

  goOrderClose() {
    app.globalData.orderAll = 'false'
    this.setData({
      orderAll: 'false'
    })
  },

  // 倒计时
  countDown(time) {
    const that = this
    console.log(time)
    let countDownNum = time
    this.setData({
      countDownNum
    })
    // setInterval(() => {
    //   countDownNum.forEach(item => {
    //     if (item > 0) {
    //       item--
    //       console.log(1)
    //     }
    //     that.setData({
    //       countDownNum
    //     })
    //   })
    // }, 1000)
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

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})