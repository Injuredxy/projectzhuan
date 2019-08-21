const netWorkComm = require("../../utils/network.js")
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    vest: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const that = this
    wx.showLoading({
      title: '正在加载...',
    })
    console.log(wx.getStorageSync('share_number'))
    that.setData({
      options,
      token: wx.getStorageSync('token')
    })
    netWorkComm.netWork({
      url: 'index_modular/IndexShow/getActivityInfo',
      para: {
        activity_id: that.data.options.activity_id,
        activity_type: '1'
      },
      success(res) {
        console.log(res.data.data)
        let nice = res.data.data.goods.product_img.filter((item, index) => {
          return (index == 0)
        })
        wx.hideLoading()
        let price = (res.data.data.direct_price - res.data.data.group_buy_price).toString()
        let two_price = price.indexOf(".")
        if (two_price != -1) {
          let new_price = (res.data.data.direct_price - res.data.data.group_buy_price).toFixed(2)
          console.log(23)
          that.setData({
            new_price
          })
        } else {
          let new_price = price
          console.log(13)
          that.setData({
            new_price
          })
        }
        that.setData({
          mini: res.data.data,
          show: true,
          nice
        })
      }
    })
  },

  onShow() {
    this.setData({
      token: wx.getStorageSync('token')
    })
  },

  goAll() {
    this.setData({
      vest: false
    })
  },

  // 订单
  goList(e) {
    const that = this
    let name = that.data.mini.goods.product_name
    let price = that.data.mini.group_buy_price > 100 ? 100 : that.data.mini.group_buy_price
    if (app.globalData.but) {
      netWorkComm.netWork({
        url: 'group_buy_modular/ActivityGroupBuyOrder/addGroupBuyOrder',
        method: "POST",
        para: {
          group_buy_id: that.data.options.activity_id,
          invitation_type: wx.getStorageSync('invitation_type'),
          parent_id: wx.getStorageSync('parent_id'),
          register_scene: wx.getStorageSync('register_scene'),
          share_number: wx.getStorageSync('share_number'),
          from_order_sn: wx.getStorageSync('from_order_sn'),
        },
        success(res) {
          console.log('发起拼团')
          console.log(res)
          if (res.data.code == '61004') {
            that.setData({
              vest: true
            })
          } else {
            let order_sn = res.data.data.order_sn
            let record_id = res.data.data.record_id
            let id = res.data.data.id
            wx.redirectTo({
              url: `/pages/goPayment/treasurePay?&order_sn=${order_sn}&new_price=${price}&product_name=${name}&buy_type=${3}&record_id=${record_id}&id=${id}`,
            })
          }
        }
      })
    }
    app.but()
  },

  // 绑定手机号
  getPhoneNumber(e) {
    const that = this
    console.log('水水水水')
    console.log(wx.getStorageSync('share_number'))
    if (e.detail.iv) {
      netWorkComm.netWork({
        url: 'user/ThreeUser/miniBind',
        method: 'POST',
        para: {
          open_id: that.data.options.openId,
          union_id: that.data.options.unionId,
          ot: 'wx',
          head_pic: that.data.options.head_pic,
          nickname: that.data.options.nickName,
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv,
          invitation_type: wx.getStorageSync('invitation_type'),
          parent_id: wx.getStorageSync('parent_id'),
          register_scene: wx.getStorageSync('register_scene'),
          share_number: wx.getStorageSync('share_number'),
          from_order_sn: wx.getStorageSync('from_order_sn'),
        },
        success(res) {
          console.log('首页绑定订单')
          console.log(res)
          wx.setStorageSync('token', res.data.msg.token)
          that.setData({
            token: wx.getStorageSync('token')
          })
          that.goList()
        }
      })
    } else {
      wx.showToast({
        title: '未绑定手机号',
        icon: 'none'
      })
    }
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