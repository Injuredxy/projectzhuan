const netWorkComm = require("../../utils/network.js")
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    vest_comment: 4,
    goods_comment: 4,
    load_comment: 4,
    value: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this
    that.setData({
      options,
      show: true
    })
  },

  // input 获取信息
  textInput(e) {
    const that = this
    that.setData({
      value: e.detail.value
    })
  },

  // 发表评价
  goEvaluate(e) {
    const that = this
    let value = that.data.value
    if (app.globalData.but) {
      netWorkComm.netWork({
        url: 'group_buy_modular/Comment/addUserComment',
        method: 'POST',
        para: {
          order_id: that.data.options.order_id,
          content: that.data.value,
          vest_comment: that.data.vest_comment,
          goods_comment: that.data.goods_comment,
          load_comment: that.data.load_comment
        },
        success(res) {
          wx.navigateBack({
            delta: 1
          })
          wx.showToast({
            title: '评论成功',
            icon: 'none'
          })
        }
      })
    }
    app.but()
  },

  // 去买
  goBuy() {
    let type = this.data.options.type
    let activity_id = this.data.options.activity_id
    if (app.globalData.but) {
      if (type == 'spike') {
        wx.navigateTo({
          url: `/pages/details/treasure?activity_id=${activity_id}`,
        })
      } else if (type == 'sample') {
        wx.navigateTo({
          url: `/pages/details/sample?activity_id=${activity_id}`,
        })
      } else {
        wx.navigateTo({
          url: `/pages/details/assemble?activity_id=${activity_id}`,
        })
      }
    }
    app.but()
  },

  // 星级选择
  in_vest(e) {
    let in_xin = e.currentTarget.dataset.in;
    let vest_comment;
    if (in_xin === 'use_sc2') {
      vest_comment = Number(e.currentTarget.id);
    } else {
      vest_comment = Number(e.currentTarget.id) + this.data.vest_comment;
    }
    console.log(e.currentTarget.id)
    console.log(this.data.vest_comment)
    this.setData({
      vest_comment
    })
  },

  in_goods(e) {
    let in_xin = e.currentTarget.dataset.in;
    console.log(e.currentTarget.id)
    let goods_comment;
    if (in_xin === 'use_sc2') {
      goods_comment = Number(e.currentTarget.id);
    } else {
      goods_comment = Number(e.currentTarget.id) + this.data.goods_comment;
    }
    this.setData({
      goods_comment
    })
  },

  in_load(e) {
    let in_xin = e.currentTarget.dataset.in;
    console.log(e.currentTarget.id)
    let load_comment;
    if (in_xin === 'use_sc2') {
      load_comment = Number(e.currentTarget.id);
    } else {
      load_comment = Number(e.currentTarget.id) + this.data.load_comment;
    }
    this.setData({
      load_comment
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  }
})