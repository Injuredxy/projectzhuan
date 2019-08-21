const netWorkComm = require("../../utils/network.js")
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    p: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showLoading({
      title: '正在加载...'
    })
    const that = this
    netWorkComm.netWork({
      url: 'scan_modular/Scan/getScanOrderInfo',
      para: {
        order_sn: options.order_sn,
        is_check: '1'
      },
      success(res) {
        console.log('优惠买单',res)
        that.setData({
          details: res.data.data
        },()=>{
          netWorkComm.netWork({
            url: 'index_modular/IndexShow/getMarketProduct',
            para: {
              store_id: that.data.details.store_info.id,
              p: 1,
              page_size: 6
            },
            success(res) {
              console.log('推荐', res)
              if (res.data.data) {
                that.setData({
                  list: res.data.data,
                  p: 1,
                  page_size: 6,
                  show: true
                })
                wx.hideLoading()
              }
            }
          })
        })
      }
    })
   
  },

  goOther(e) {
    console.log(e)
    let type = e.currentTarget.dataset.item.type
    let activity_id = e.currentTarget.dataset.item.data.activity_id
    if (type == 'spike') {
      wx.navigateTo({
        url: `/pages/details/treasure?activity_id=${activity_id}`,
      })
    } else if (type == 'temai') {
      wx.navigateTo({
        url: `/pages/details/sample?activity_id=${activity_id}`,
      })
    } else if (type == 'group_buy') {
      wx.navigateTo({
        url: `/pages/details/assemble?activity_id=${activity_id}`,
      })
    }
  },

  // 打电话
  goIphon() {
    const that = this
    if (app.globalData.but) {
      wx.makePhoneCall({
        phoneNumber: that.data.details.store_info.mobile
      })
    }
    app.but()
  },

  //商家信息
  goStore() {
    let store_id = this.data.details.store_info.id
    if (app.globalData.but) {
      wx.navigateTo({
        url: `../goStore/index?store_id=${store_id}`,
      })
    }
    app.but()
  },

  // 去买
  goBuy(e) {
    console.log(e)
    let activity_id = e.currentTarget.dataset.item.data.activity_id
    let type = e.currentTarget.dataset.item.type
    if (app.globalData.but) {
      if (type == 'spike') {
        wx.navigateTo({
          url: `/pages/details/treasure?activity_id=${activity_id}`
        })
      } else if (type == 'group_buy') {
        wx.navigateTo({
          url: `/pages/details/assemble?activity_id=${activity_id}`
        })
      }
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
    const that = this
    netWorkComm.netWork({
      url: 'index_modular/IndexShow/getMarketProduct',
      para: {
        store_id: that.data.details.store_info.id,
        p: that.data.p + 1,
        page_size: 6
      },
      success(res) {
        console.log('推荐', res)
        if (res.data.data) {
          let list1 = that.data.list.concat(res.data.data)
          that.setData({
            list: list1,
            p: that.data.p + 1,
            page_size: 6
          })
        }
      }
    })
  },
})