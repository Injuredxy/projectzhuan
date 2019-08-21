const app = getApp()
const netWorkComm = require("../../utils/network.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    token: wx.getStorageSync('token')
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('订单详情页接收的数据')
    console.log(options)
    const that = this
    netWorkComm.netWork({
      url: 'spike_modular/Home/getSpikeInfo',
      para: {
        activity_id: options.activity_id
      },
      success: function(res) {
        console.log(res.data.data)
        let nice = res.data.data.goods.product_img.filter((item, index) => {
          return (index == 0)
        })
        that.setData({
          list: res.data.data,
          show: true,
          nice
        })
      },
    })
    that.setData({
      options
    })
  },

  // 绑定手机号
  getPhoneNumber(e) {
    const that = this
    if(e.detail.iv) {
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
          wx.setStorageSync('token', res.data.msg.token)
          that.setData({
            token: wx.getStorageSync('token')
          })
          that.goBuy()
        }
      })
    } else {
      wx.showToast({
        title: '未绑定手机号',
        icon: 'none'
      })
    }
  },

  // 点击提交订单
  goBuy(e) {
    let activity_id = this.data.list.id
    let new_price = this.data.list.group_buy_price
    let product_name = this.data.list.goods.product_name
    console.log('砍价分享码')
    console.log(wx.getStorageSync('share_number'))
    console.log(wx.getStorageSync('from_order_sn'))
    if (app.globalData.but) {
      netWorkComm.netWork({
        url: "spike_modular/SpikeOrder/addOrder",
        method: 'POST',
        para: {
          activity_id: activity_id,
          invitation_type: wx.getStorageSync('invitation_type'),
          parent_id: wx.getStorageSync('parent_id'),
          register_scene: wx.getStorageSync('register_scene'),
          share_number: wx.getStorageSync('share_number'),
          from_order_sn: wx.getStorageSync('from_order_sn'),
        },
        success(res) {
          console.log('详情')
          console.log(res)
          if (res.data.code == 60104) {
            wx.showToast({
              title: res.data.msg,
              icon: 'none'
            })
          } else if (res.data.code == 10108) {
            wx.showToast({
              title: res.data.msg,
              icon: 'none'
            })
          } else if (res.data.code == 10004) {
            wx.showToast({
              title: res.data.msg,
              icon: 'none'
            })
          } else {
            let order_sn = res.data.data.order_sn
            wx.navigateTo({
              url: `./treasurePay?activity_id=${activity_id}&order_sn=${order_sn}&new_price=${new_price}&product_name=${product_name}&buy_type=${2}`,
            })
          }
        },
        fail(err) { }
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
    this.setData({
      token: wx.getStorageSync('token')
    })
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