const netWorkComm = require("../../utils/network.js")
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 精品推荐数据
    recommend: {
      list: []
    },
    show: false,
    p: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.getHomeData()
  },

  // 请求数据
  getHomeData() {
    const that = this
    wx.showLoading({
      title: '正在加载...'
    })
    //聚拼团列表
    netWorkComm.netWork({
      url: 'index_modular/IndexShow/sampleList',
      para: {
        lat: wx.getStorageSync('lat'),
        lng: wx.getStorageSync('lng'),
        p: 1
      },
      success: function (res) {
        console.log(res.data.data)
        that.setData({
          p: 1,
          'recommend.list': res.data.data
        })
        wx.hideLoading()
      }
    })
    wx.stopPullDownRefresh()
  },

  //去拼团
  toGroup: function (e) {
    let activity_id = e.currentTarget.dataset.item.goods.activity_id
    let activity_type = e.currentTarget.dataset.item.activity_type
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/details/clearance?activity_id=${activity_id}&activity_type=${activity_type}`
      })
    }
    app.but()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setData({
      show: true
    })
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
    const that = this
    //聚拼团列表
    netWorkComm.netWork({
      url: 'index_modular/IndexShow/sampleList',
      para: {
        lat: wx.getStorageSync('lat'),
        lng: wx.getStorageSync('lng'),
        p: that.data.p + 1
      },
      success: function (res) {
        if (res.data.data) {
          console.log(res.data.data)
          let list = that.data.recommend.list.concat(res.data.data)
          that.setData({
            p: that.data.p + 1,
            'recommend.list': list
          })
        }
      }
    })
  }
})