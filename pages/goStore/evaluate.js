const netWorkComm = require("../../utils/network.js")
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      options
    })
    this.getHomeData()
  },

  getHomeData() {
    const that = this
    wx.showLoading({
      title: '正在加载...',
    })
    netWorkComm.netWork({
      url: 'group_buy_modular/Comment/getUserCommentList',
      para: {
        is_self: '0',
        store_id: that.data.options.store_id,
        activity_id: that.data.options.activity_id,
        order_id: that.data.options.order_id,
        page_size: that.data.options.page_size
      },
      success(res) {
        console.log(res.data.data)
        wx.hideLoading()
        that.setData({
          follow: res.data.data,
          show: true
        })
        wx.hideLoading()
      }
    })
    wx.stopPullDownRefresh()
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
    app.globalData.but = true
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
    this.getHomeData()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  }
})