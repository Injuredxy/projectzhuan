// pages/user/red.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sliderOffset: 92,
    current: 1,
    title: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  clickTab1(e) {
    this.setData({
      sliderOffset: 92,
      current:1
    })
  },

  clickTab2(e) {
    this.setData({
      sliderOffset: 342,
      current: 2
    })
  },

  clickTab3(e) {
    this.setData({
      sliderOffset: 600,
      current: 3
    })
  },

  goTitle(e) {
    let item = e.currentTarget.dataset.item
    // item.
    this.setData({
      title: !this.data.title,
      // current
    })
  },

  goAll(){
    this.setData({
      title: false
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