const app = getApp()
const netWorkComm = require("../../utils/network.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    p: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getHomeData()
  },

  // 获取信息
  getHomeData() {
    const that = this
    wx.showLoading({
      title: '正在加载...',
    })
    netWorkComm.netWork({
      url: 'index_modular/IndexShow/getStoreList',
      para: {
        p: 1
      },
      success(res) {
        console.log(res.data.data)
        that.setData({
          p: 1,
          union: res.data.data
        })
        wx.hideLoading()
      }
    })
    wx.stopPullDownRefresh()
  },

  // 商家信息
  goStore(e) {
    console.log(e)
    let store_id = this.data.union[e.currentTarget.dataset.index].id
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/goStore/index?store_id=${store_id}`
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
    const that = this
    netWorkComm.netWork({
      url: 'index_modular/IndexShow/getStoreList',
      para: {
        p: that.data.p + 1
      },
      success(res) {
        if (res.data.data) {
          let union = that.data.union.concat(res.data.data)
          console.log(res.data.data)
          console.log(union)
          that.setData({
            p: that.data.p + 1,
            union
          })
        }
      }
    })
  }
})