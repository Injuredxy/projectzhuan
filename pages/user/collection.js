const app = getApp()
const netWorkComm = require("../../utils/network.js")

Page({

  data: {
    active: -1,
    collection: {
      list: []
    },
    show: true,
    nice: false,
    collection: [],
    startX: 0, //开始坐标
    startY: 0,
    concernList: [],
    p: 1
  },

  onLoad: function(options) {
    const that = this
    that.storeList()
    that.goodsList()
  },

  // 商家收藏信息
  storeList() {
    const that = this
    netWorkComm.netWork({
      url: 'user/Concern/getUserConcernList',
      method: 'POST',
      para: {
        page_size: 100
      },
      success(res) {
        console.log('收藏信息')
        console.log(res.data.data)
        that.setData({
          concernList: res.data.data
        })
      }
    })
  },

  // 商品信息
  goodsList() {
    const that = this
    netWorkComm.netWork({
      url: 'user/Collection/getUserCollectionlist',
      method: 'POST',
      para: {
        lat: wx.getStorageSync('lat'),
        lng: wx.getStorageSync('lng'),
        p: that.data.p
      },
      success(res) {
        console.log(res.data.data)
        that.setData({
          collection: res.data.data
        })
      }
    })
    wx.stopPullDownRefresh()
  },

  // 打电话
  goIphon(e) {
    const that = this
    let mobile = e.currentTarget.dataset.item.mobile
    if (app.globalData.but) {
      wx.makePhoneCall({
        phoneNumber: mobile,
      })
    }
    app.but()
  },

  // 商家
  goStore(e) {
    let store_id = e.currentTarget.dataset.item.id
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/goStore/index?store_id=${store_id}`,
      })
    }
    app.but()
  },

  // 商品
  goShop(e) {
    let type = e.currentTarget.dataset.item.type
    let id = e.currentTarget.dataset.item.data.activity_id
    if (app.globalData.but) {
      if (type == 'spike') {
        wx.navigateTo({
          url: `/pages/details/treasure?activity_id=${id}`
        })
      } else if (type == 'group_buy') {
        wx.navigateTo({
          url: `/pages/details/assemble?activity_id=${id}`
        })
      } else if (type == 'temai') {
        wx.navigateTo({
          url: `/pages/details/sample?activity_id=${id}`
        })
      }
    }
    app.but()
  },

  onHide() {
    app.globalData.but = true
  },

  // 线
  goXian1() {
    this.setData({
      show: true,
      nice: false,
      p: 1
    })
  },

  goXian2() {
    this.setData({
      nice: true,
      show: false,
      p: 1
    })
  },

  //手指触摸动作开始 记录起点X坐标
  touchstart: function(e) {
    //开始触摸时 重置所有删除
    const that = this
    console.log(that.data.concernList)
    that.data.concernList.forEach(function(v, i) {
      if (v.isTouchMove) //只操作为true的
        v.isTouchMove = false;
    })
    that.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      concernList: that.data.concernList
    })
  },

  touchstart1: function(e) {
    //开始触摸时 重置所有删除
    const that = this
    console.log(that.data.collection)
    that.data.collection.forEach(function(v, i) {
      if (v.isTouchMove) //只操作为true的
        v.isTouchMove = false;
    })
    that.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      collection: that.data.collection
    })
  },

  //滑动事件处理
  touchmove: function(e) {
    console.log(e)
    var that = this,
      index = e.currentTarget.dataset.index, //当前索引
      startX = that.data.startX, //开始X坐标
      startY = that.data.startY, //开始Y坐标
      touchMoveX = e.changedTouches[0].clientX, //滑动变化坐标
      touchMoveY = e.changedTouches[0].clientY, //滑动变化坐标
      //获取滑动角度
      angle = that.angle({
        X: startX,
        Y: startY
      }, {
        X: touchMoveX,
        Y: touchMoveY
      });
    that.data.concernList.forEach(function(v, i) {
      v.isTouchMove = false
      //滑动超过30度角 return
      if (Math.abs(angle) > 30) return;
      if (i == index) {
        if (touchMoveX > startX) //右滑
          v.isTouchMove = false
        else //左滑
          v.isTouchMove = true
      }
    })
    //更新数据
    that.setData({
      concernList: that.data.concernList
    })
  },

  touchmove1: function(e) {
    console.log(e)
    var that = this,
      index = e.currentTarget.dataset.index, //当前索引
      startX = that.data.startX, //开始X坐标
      startY = that.data.startY, //开始Y坐标
      touchMoveX = e.changedTouches[0].clientX, //滑动变化坐标
      touchMoveY = e.changedTouches[0].clientY, //滑动变化坐标
      //获取滑动角度
      angle = that.angle({
        X: startX,
        Y: startY
      }, {
        X: touchMoveX,
        Y: touchMoveY
      });
    that.data.collection.forEach(function(v, i) {
      v.isTouchMove = false
      //滑动超过30度角 return
      if (Math.abs(angle) > 30) return;
      if (i == index) {
        if (touchMoveX > startX) //右滑
          v.isTouchMove = false
        else //左滑
          v.isTouchMove = true
      }
    })
    //更新数据
    that.setData({
      collection: that.data.collection
    })
  },

  /**
  
  * 计算滑动角度
  
  * @param {Object} start 起点坐标
  
  * @param {Object} end 终点坐标
  
  */

  angle: function(start, end) {
    var _X = end.X - start.X,
      _Y = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },

  //删除事件
  storeDel: function(e) {
    const that = this
    console.log(e)
    netWorkComm.netWork({
      url: 'user/Concern/removeConcern',
      para: {
        store_id: e.currentTarget.dataset.item.id
      },
      success(res) {
        that.storeList()
      }
    })
  },

  goodsDel: function(e) {
    const that = this
    console.log(e)
    let id = e.currentTarget.dataset.item.data.activity_id
    netWorkComm.netWork({
      url: 'user/Collection/removeCollection',
      para: {
        activity_id: id
      },
      success(res) {
        that.goodsList()
      }
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.storeList()
    this.goodsList()
  },

  // 上拉加载
  onReachBottom() {
    const that = this
    // if (that.data.show) {
    //   netWorkComm.netWork({
    //     url: 'user/Concern/getUserConcernList',
    //     method: 'POST',
    //     para: {
    //       p: that.data.p + 1
    //     },
    //     success(res) {
    //       console.log('收藏信息')
    //       console.log(res.data.data)
    //       if (res.data.data) {
    //         let concernList = that.data.concernList.concat(res.data.data)
    //         that.setData({
    //           p: that.data.p + 1,
    //           concernList
    //         })
    //       }
    //     }
    //   })
    // } else 
    if (that.data.nice) {
      netWorkComm.netWork({
        url: 'user/Collection/getUserCollectionlist',
        method: 'POST',
        para: {
          lat: wx.getStorageSync('lat'),
          lng: wx.getStorageSync('lng'),
          p: that.data.p + 1
        },
        success(res) {
          console.log('商品信息')
          console.log(res.data.data)
          if (res.data.data) {
            let collection = that.data.collection.concat(res.data.data)
            console.log(collection)
            that.setData({
              p: that.data.p + 1,
              collection
            })
          }
        }
      })
    }
  },
})