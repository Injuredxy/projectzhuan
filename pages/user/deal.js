const app = getApp()
const netWorkComm = require("../../utils/network.js")

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
  onLoad: function(options) {
    wx.showLoading({
      title: '正在加载...',
    })
    this.getHomeData()
  },

  getHomeData() {
    const that = this
    wx.showLoading({
      title: '正在加载...',
    })
    netWorkComm.netWork({
      url: 'user/User/getOrderStoreList',
      para: {
        lat: wx.getStorageSync('lat'),
        lng: wx.getStorageSync('lng')
      },
      success(res) {
        console.log(res.data.data)
        wx.hideLoading()
        that.setData({
          deal: res.data.data,
          show: true
        })
        wx.hideLoading()
      }
    })
    wx.stopPullDownRefresh()
  },

  // 商铺
  goStore(e) {
    let store_id = this.data.deal[e.currentTarget.dataset.index].id
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/goStore/index?store_id=${store_id}`,
      })
    }
    app.but()
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
    app.globalData.but = true
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
    this.getHomeData()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  }
})