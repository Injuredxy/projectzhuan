const netWorkComm = require("../../utils/network.js")
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const that = this
    console.log(options)
    wx.showLoading({
      title: '正在加载...'
    })
    that.setData({
      options
    })
    let type = that.options.type
    if (type == 'group') {
      netWorkComm.netWork({
        url: 'group_buy_modular/ActivityGroupBuyOrder/getGroupBuyRecord',
        para: {
          group_buy_record_id: that.data.options.record_id,
          is_check: that.data.options.is_check
        },
        success(res) {
          console.log(res)
          that.setData({
            fabulous: res.data.data,
            show: true
          })
          wx.hideLoading()
        }
      })
    } else if (type == 'spike') {
      netWorkComm.netWork({
        url: 'spike_modular/SpikeOrder/orderInfo',
        para: {
          order_sn: that.data.options.order_sn,
          is_check: '1'
        },
        success(res) {
          console.log(res)
          that.setData({
            treasure: res.data.data,
            show: true
          })
          wx.hideLoading()
        }
      })
    } else if (type == 'sample') {
      netWorkComm.netWork({
        url: 'sample_modular/SampleOrder/orderInfo',
        para: {
          order_sn: that.data.options.order_sn,
          is_check: '1'
        },
        success(res) {
          console.log(res)
          that.setData({
            sample: res.data.data,
            show: true
          })
          wx.hideLoading()
        }
      })
    } else if (type == 'direct') {
      netWorkComm.netWork({
        url: 'payment_modular/CommonPay/getOrderInfo',
        para: {
          order_id: that.data.options.id,
          is_check: '1'
        },
        success(res) {
          console.log(res)
          that.setData({
            nice: res.data.data,
            show: true
          })
          wx.hideLoading()
        }
      })
    }
  },

  // 去买
  goShop() {
    const that = this
    let type = that.options.type
    console.log(type)
    if (app.globalData.but) {
      if (type == 'direct') {
        let activity_id = that.data.nice.goods.activity_id
        wx.navigateTo({
          url: `/pages/details/assemble?activity_id=${activity_id}`,
        })
      } else if (type == 'group') {
        let activity_id = that.data.fabulous.activity_group_buy.activity_id
        wx.navigateTo({
          url: `/pages/details/assemble?activity_id=${activity_id}`,
        })
      } else if (type == 'sample') {
        let activity_id = that.data.sample.goods.activity_id
        wx.navigateTo({
          url: `/pages/details/sample?activity_id=${activity_id}`,
        })
      } else if (type == 'spike') {
        let activity_id = that.data.treasure.id
        wx.navigateTo({
          url: `/pages/details/treasure?activity_id=${activity_id}`,
        })
      }
    }
    app.but()
  },

  // 打电话
  goIphon(e) {
    console.log(e)
    if (app.globalData.but) {
      wx.makePhoneCall({
        phoneNumber: '400-800-5563'
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