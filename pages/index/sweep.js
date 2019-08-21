const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false
  },

  // 去扫码
  toSweep() {
    if (app.globalData.but) {
      wx.scanCode({
        onlyFromCamera: false,
        scanType: ['barCode', 'qrCode', 'datamatrix', 'pdf417'],
        success(res) {
          console.log(res)
          let url = res.result.replace("?", "&")
          let share = res.result.split('share_number=')
          wx.navigateTo({
            url: `/pages/web/sweep?scan_uri=${url}&share_number=${share[1]}`,
          })
        }
      })
    }
    app.but()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      show: true
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  }
})