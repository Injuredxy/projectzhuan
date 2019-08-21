const app = getApp()
const netWorkComm = require("../../utils/network.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    token: wx.getStorageSync('token'),
    show: false,
    page: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (wx.getStorageSync('token')) {
      this.msg()
    } else {
      this.setData({
        show: true
      })
    }
  },

  msg() {
    const that = this
    wx.showLoading({
      title: '正在加载...',
    })
    netWorkComm.netWork({
      url: 'user/User/getMessageList',
      para: {
        page: 1
      },
      success(res) {
        that.setData({
          page: 1,
          msgs: res.data.data.data,
          time: res.data.data.time,
          show: true
        })
        wx.hideLoading()
      }
    })
    wx.stopPullDownRefresh()
  },


  // 查看详情
  goDetails(e) {
    const that = this
    let status = e.currentTarget.dataset.item.order_status
    let parameter = e.currentTarget.dataset.item.parameter
    let id = parameter.order_id
    let order_sn = parameter.order_sn
    let record_id = parameter.record_id
    let user_message_id = e.currentTarget.dataset.item.user_message_id
    if (app.globalData.but) {
      netWorkComm.netWork({
        url: 'user/User/readMessage',
        method: 'POST',
        para: {
          user_message_id: user_message_id
        },
        success(res) {
          console.log(res)
          if (status.is_close == 1) {
            if (parameter.order_type == 1) {
              wx.navigateTo({
                url: `/pages/goAssemble/refund?id=${id}&type=${"direst"}`
              })
            } else if (parameter.order_type == 2) {
              wx.navigateTo({
                url: `/pages/goAssemble/refund?id=${id}&record_id=${record_id}&type=${"group"}`
              })
            } else if (parameter.order_type == 3) {
              wx.navigateTo({
                url: `/pages/goAssemble/refund?order_sn=${order_sn}&type=${"spike"}`
              })
            }
          } else {
            if (parameter.order_type == 1) {
              wx.navigateTo({
                url: `/pages/goAssemble/direct?id=${id}`
              })
            } else if (parameter.order_type == 2) {
              wx.navigateTo({
                url: `/pages/goAssemble/groubInfo?id=${id}&record_id=${record_id}`
              })
            } else if (parameter.order_type == 3) {
              wx.navigateTo({
                url: `/pages/goPayment/help?order_sn=${order_sn}`
              })
            }
          }
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
    if (wx.getStorageSync('token')) {
      this.msg()
    }
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
    if (wx.getStorageSync('token')) {
      this.msg()
    }else {
      wx.stopPullDownRefresh()
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    const that = this
    if (wx.getStorageSync('token')) {
      netWorkComm.netWork({
        url: 'user/User/getMessageList',
        para: {
          page: that.data.page + 1
        },
        success(res) {
          let msgs = that.data.msgs.concat(res.data.data.data)
          console.log(msgs)
          that.setData({
            msgs,
            page: that.data.page + 1,
            time: res.data.data.time,
            show: true
          })
        }
      })
    }
  }
})