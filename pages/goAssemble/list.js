const netWorkComm = require("../../utils/network.js")
const app = getApp()
let tickers = []

Page({

  /**
   * 页面的初始数据
   */
  data: {
    current: 1,
    sliderOffset: 150
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.current) {
      this.setData({
        current: options.current
      })
      if (options.current == 1) {
        this.setData({
          sliderOffset: 150
        })
      } else {
        this.setData({
          sliderOffset: 530
        })
      }
    }
    this.getHomeData1()
  },

  clickTab1(e) {
    this.setData({
      sliderOffset: 150,
      current: 1
    })
    // if (this.data.page_size != 1) {
    //   this.getHomeData()
    // }
  },

  clickTab2(e) {
    this.setData({
      sliderOffset: 530,
      current: 2
    })
    // if (this.data.page_size != 1) {
    //   this.getHomeData1()
    // }
  },

  getHomeData() {
    const that = this
    wx.showLoading({
      title: '正在加载...',
    })
    netWorkComm.netWork({
      url: "index_modular/IndexShow/getGroupBuyRecordList",
      para: {
        record_status: '0',
        more: 'true'
      },
      method: 'POST',
      success(res) {
        console.log('拼团进行中', res.data.data)
        if (res.data.data) {
          let orderTime = res.data.data
          orderTime.forEach((item, index) => {
            item.time = item.has_time
            let timeOut1 = setInterval(() => {
              item.time--;
              that.setData({
                underwayList: orderTime
              })
              if (item.time == 0) {
                clearInterval(timeOut1)
              }
            }, 1000)
            tickers.push(timeOut1)
          })
          that.setData({
            underwayList: res.data.data
          })
        }
        wx.hideLoading()
      }
    })
  },

  getHomeData1() {
    const that = this
    netWorkComm.netWork({
      url: "index_modular/IndexShow/getGroupBuyRecordList",
      para: {
        record_status: '1',
        more: 'true'
      },
      method: 'POST',
      success(res) {
        console.log('已成团', res.data.data)
        if (res.data.data) {
          that.setData({
            successList: res.data.data
          })
        }
        wx.stopPullDownRefresh()
      }
    })
  },

  goGoods(e) {
    if (app.globalData.but) {
      let record_id = e.currentTarget.dataset.item.id
      wx.navigateTo({
        url: `/pages/goAssemble/groubInfo?record_id=${record_id}`,
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
    this.getHomeData()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    app.globalData.but = true
    if (tickers) {
      tickers.forEach(t => {
        if (t) {
          clearInterval(t)
        }
      })
    }
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
    this.getHomeData1()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    const that = this
    // wx.showLoading({
    //   title: '正在加载...',
    // })
    // if (that.data.current == 1) {
    //   netWorkComm.netWork({
    //     url: "index_modular/IndexShow/getGroupBuyRecordList",
    //     para: {
    //       record_status: '0',
    //       more: 'true'
    //     },
    //     method: 'POST',
    //     success(res) {
    //       console.log('拼团进行中', res.data.data)
    //       let underwayList = that.data.underwayList.concat(res.data.data)
    //       that.setData({
    //         underwayList,
    //       })
    //       wx.hideLoading()
    //     }
    //   })
    // } else {
    //   netWorkComm.netWork({
    //     url: "index_modular/IndexShow/getGroupBuyRecordList",
    //     para: {
    //       record_status: '1',
    //       more: 'true'
    //     },
    //     method: 'POST',
    //     success(res) {
    //       if (res.data.data) {
    //         console.log('已成团', res.data.data)
    //         let successList = that.data.successList.concat(res.data.data)
    //         that.setData({
    //           successList,
    //         })
    //         wx.hideLoading()
    //       }
    //     }
    //   })
    // }
  }
})