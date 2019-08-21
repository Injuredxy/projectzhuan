const netWorkComm = require("../../utils/network.js")
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
  onLoad: function(options) {
    const that = this
    netWorkComm.netWork({
      url: 'index_modular/IndexShow/getStoreMoreInfo',
      para: {
        store_id: options.store_id
      },
      success(res) {
        console.log(res)
        wx.setNavigationBarTitle({
          title: `${res.data.data.brand}（${res.data.data.market}）`
        })
        let nice = res.data.data.store_cover.filter((item, index) => {
          return (index == 0)
        })
        let store_cover = res.data.data.store_cover
        console.log(store_cover)
        let store_image = []
        store_cover.forEach(item => {
          store_image.push(
            item.url
          )
        })
        console.log('店铺信息')
        console.log(res.data.data)
        that.setData({
          store: res.data.data,
          id: res.data.data.id,
          store_id: res.data.data.id,
          is_concern: res.data.data.is_concern,
          nice,
          store_image
        })
      }
    })
  },

  // 地图
  goMap() {
    const that = this
    if (app.globalData.but) {
      wx.openLocation({
        latitude: parseFloat(that.data.store.lat),
        longitude: parseFloat(that.data.store.lng),
        name: that.data.store.brand,
        address: that.data.store.market
      })
    }
    app.but()
  },

  goSweep() {
    if (app.globalData.but) {
      const that = this
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