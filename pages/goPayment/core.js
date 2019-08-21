const netWorkComm = require("../../utils/network.js")
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    sweep: false,
    play: false,
    bargain: false,
    notoken: true,
    token: wx.getStorageSync('token')
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const that = this
    that.toCore()
    that.setData({
      options
    })
  },

  // 任务列表
  toCore() {
    const that = this
    wx.showLoading({
      title: '正在加载...',
    })
    netWorkComm.netWork({
      url: 'spike_modular/Task/getList',
      method: 'POST',
      success(res) {
        console.log('任务列表')
        console.log(res.data.data)
        that.setData({
          count: res.data.count,
          core: res.data.data,
          list: res.data.data.list,
          show: true
        })
        wx.hideLoading()
      }
    })
    wx.stopPullDownRefresh()
  },

  // 无效点击
  goClick() {
    return
  },

  // 关闭
  goAll() {
    this.setData({
      sweep: false,
      play: false,
      bargain: false
    })
  },

  // 滚动穿透
  preventMove() {
    return
  },

  // 砍价记录
  goRecord() {
    if (app.globalData.but) {
      wx.navigateTo({
        url: '/pages/goPayment/record',
      })
    }
    app.but()
  },

  // 领取奖励
  goReward(e) {
    const that = this
    let id = e.currentTarget.dataset.item.id
    netWorkComm.netWork({
      url: 'spike_modular/Task/receiveReward',
      method: 'POST',
      para: {
        task_id: id
      },
      success(res) {
        that.toCore()
        wx.showToast({
          title: '免费领资格＋1',
          icon: 'none'
        })
      }
    })
  },

  // 领取任务
  goCore(e) {
    const that = this
    let id = e.currentTarget.dataset.item.id
    netWorkComm.netWork({
      url: 'spike_modular/Task/receiveTask',
      method: 'POST',
      para: {
        task_id: id
      },
      success(res) {
        that.toCore()
        wx.showToast({
          title: '领取任务成功',
          icon: 'none'
        })
      }
    })
  },


  // 点击弹框
  goBargain(e) {
    const that = this
    let id = e.currentTarget.dataset.item.id
    let type = e.currentTarget.dataset.item.activity_type
    if (id == 14) {
      this.setData({
        id,
        type,
        bargain: true
      })
    } else {
      that.goComplete(e)
    }
  },

  goSweep() {
    this.setData({
      sweep: true
    })
  },

  goSweeps() {
    if (app.globalData.but) {
      this.setData({
        sweep: false
      })
      wx.navigateTo({
        url: '/pages/index/sweep'
      })
    }
    app.but()
  },

  // 玩法介绍
  goPlay() {
    this.setData({
      play: true
    })
  },

  // 去完成
  goComplete(e) {
    let item = e.currentTarget.dataset.item
    let type = e.currentTarget.dataset.item.activity_type
    if (app.globalData.but) {
      this.setData({
        sweep: false
      })
      if (type == 1) {
        wx.navigateTo({
          url: '/pages/index/assemble'
        })
      } else if (type == 2) {
        wx.navigateTo({
          url: '/pages/index/sample',
        })
      } else if (type == 3) {
        wx.switchTab({
          url: '/pages/index/treasure',
        })
      } else if (type == 4) {
        wx.navigateTo({
          url: '/pages/index/sweep',
        })
      }
      if(item.id==14) {
        this.setData({
          bargain: true
        })
      }
    }
    app.but()
  },

  // 去完成2
  goComplete1() {
    const that = this
    let type = that.data.type
    if (app.globalData.but) {
      that.setData({
        sweep: false
      })
      if (type == 1) {
        wx.navigateTo({
          url: '/pages/index/assemble'
        })
      } else if (type == 3) {
        wx.switchTab({
          url: '/pages/index/treasure',
        })
      }
    }
    app.but()
  },

  goTreasure() {
    wx.switchTab({
      url: '/pages/index/treasure',
    })
  },

  // 关闭
  goClose() {
    this.setData({
      sweep: false,
      play: false
    })
  },

  // 绑定手机号
  getPhoneNumber(e) {
    console.log(e)
    const that = this
    that.setData({
      notoken: false
    })
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
          wx.setStorageSync('token', res.data.msg.token)
          that.setData({
            token: wx.getStorageSync('token'),
            notoken: true
          })
          that.toCore()
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
    this.toCore()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  }
})