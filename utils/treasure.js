const netWorkComm = require("../../utils/network.js")
let SocketTask, SocketTask2;
const Config = require('../../utils/config.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    service: false,
    parameter: false,
    customer: false,
    collection: true,
    refuse: false,
    codes: false,
    show: false,
    objShow: false,
    hideIcon: true,
    showAll: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const that = this
    wx.showLoading({
      title: '正在加载...',
    })
    console.log('分享码')
    console.log(options)
    wx.setStorageSync('invitation_type', options.invitation_type ? options.invitation_type : wx.getStorageSync('invitation_type'))
    wx.setStorageSync('parent_id', options.parent_id ? options.parent_id : wx.getStorageSync('parent_id'))
    wx.setStorageSync('register_scene', options.register_scene ? options.register_scene : wx.getStorageSync('register_scene'))
    wx.setStorageSync('share_number', options.share_number ? options.share_number : wx.getStorageSync('share_number'))
    wx.setStorageSync('from_order_sn', options.from_order_sn ? options.from_order_sn : wx.getStorageSync('from_order_sn'))
    netWorkComm.netWork({
      url: 'spike_modular/Home/getSpikeInfo',
      para: {
        activity_id: options.activity_id
      },
      success(res) {
        console.log(2323)
        console.log(res.data.data)
        that.setData({
          treasure: res.data.data,
          activity_id: res.data.data.goods.activity_id,
          is_collection: res.data.data.is_collection,
          name: res.data.data.store.brand,
          newPrice: res.data.data.group_buy_price,
          oldPrice: res.data.data.origin_price,
          stock: res.data.data.stock,
          bar: res.data.data.progress_bar * 100,
          img: res.data.data,
          store_id: res.data.data.store_id,
          show: true,
          time: res.data.data.difference_time,
          text: res.data.data.goods.product_info
        }, () => {
          that.countDown()
          that.goSocket()
          that.comment()
          // that.setNum()
        })
        wx.hideLoading()
      }
    })
    wx.login({
      success(res) {
        that.setData({
          code: res.code
        })
      }
    })
    that.canvasClock()
    that.setData({
      token: wx.getStorageSync("token")
    })
  },

  // setNum() {
  //   const that = this
  //   let obj = that.data.obj
  //   console.log('dsfsadf')
  //   console.log(obj)
  //   let obj1 = obj.filter((item, index) => {
  //     return (index = 0)
  //   })
  //   setInterval(() => {
  //     // console.log(obj1)
  //     that.setData({
  //       obj: that.data.obj.push(obj1)
  //     }, 10000)
  //     console.log('减少')
  //     console.log(that.data.obj)
  //   })
  // },

  // 画布分享图片
  canvasClock(e) {
    let name = this.data.name
    let newPrice = this.data.newPrice
    let oldPrice = this.data.oldPrice
    let stock = this.data.stock
    let bar = this.data.bar
    const ctx = wx.createCanvasContext('canvas2')
    // ctx.setStrokeStyle("#00ff00");
    // //线条宽度5
    // ctx.setLineWidth(5);
    // //绘制矩形
    // ctx.rect(0, 0, 100, 100);
    // //关闭
    // ctx.stroke();
    // // ctx.drawImage(e, 0, 0, 420, 336)
    // // 原价
    // ctx.setFontSize(12)
    // ctx.setFillStyle('#fff')
    // // ctx.fillText(name, 41, 123)
    // // ￥
    // ctx.setFontSize(15)
    // ctx.setFillStyle('#F1AC34')
    // ctx.fillText('¥', 10, 132)
    // // 现价
    // ctx.setFontSize(32)
    // ctx.setFillStyle('#F1AC34')
    // ctx.fillText('{{this.data.newPrice}}', 22, 132)
    // // 限量
    // ctx.setFontSize(10)
    // ctx.setFillStyle('#fff')
    // ctx.fillText('限量16件', 137, 139)
    // // 赞助商
    // ctx.setFontSize(12)
    // ctx.setFillStyle('#fff')
    // ctx.fillText('本活动商品由深圳科勒卫浴特约赞助', 10, 154)
    ctx.draw(true,
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: 420, //画布宽高
        height: 336,
        destWidth: 840, //画布宽高*dpr 以iphone6为准
        destHeight: 672,
        canvasId: 'canvas2',
        success: function(res) {
          console.log(1) //生成的临时图片路径
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: function(res) {
              console.log(res);
              wx.showToast({
                title: '保存成功',
              })
            }
          })
        }
      })
    )
  },

  // 滚动穿透
  preventMove() {
    return
  },

  // 查看全部
  showAll() {
    this.setData({
      showAll: false
    })
  },

  // 收起全部
  hideAll() {
    this.setData({
      showAll: true
    })
  },

  // 全部评价
  goEvaluate() {
    const that = this
    let activity_id = that.data.activity_id
    let page_size = that.data.page_size
    wx.navigateTo({
      url: `/pages/goStore/evaluate?activity_id=${activity_id}&page_size=${page_size}`,
    })
  },

  // 评论
  comment() {
    const that = this
    let activity_id = that.data.activity_id
    // 评论列表
    netWorkComm.netWork({
      url: 'group_buy_modular/Comment/getUserCommentList',
      para: {
        is_self: '0',
        activity_id: activity_id
      },
      success(res) {
        console.log(res.data)
        wx.hideLoading()
        that.setData({
          follow: res.data.data,
          page_size: res.data.count,
          show: true
        })
      }
    })
  },

  // 收藏
  goCollection() {
    const that = this
    that.setData({
      is_collection: !that.data.is_collection
    })
    if (that.data.is_collection) {
      wx.showToast({
        title: '收藏成功',
        icon: 'none'
      })
      netWorkComm.netWork({
        url: 'user/Collection/addCollection',
        para: {
          activity_id: that.data.activity_id
        },
        success(res) {
          // console.log(res)
        }
      })
    } else {
      wx.showToast({
        title: '取消收藏成功',
        icon: 'none'
      })
      netWorkComm.netWork({
        url: 'user/Collection/removeCollection',
        para: {
          activity_id: that.data.activity_id
        },
        success(res) {
          // console.log(res)
        }
      })
    }
  },

  // 取消
  goClose() {
    this.setData({
      refuse: false,
      codes: false,
      customer: false,
    })
  },

  // 打电话
  goIphon() {
    const that = this
    wx.makePhoneCall({
      phoneNumber: that.data.treasure.store.mobile
    })
  },

  // 打客服
  goIphons(e) {
    const that = this
    let mobile = e.currentTarget.dataset.mobile
    wx.makePhoneCall({
      phoneNumber: mobile
    })
  },


  //  次数
  goCore() {
    this.setData({
      codes: false
    })
    wx.navigateTo({
      url: '/pages/goPayment/core'
    })
  },

  // 继续购买
  goNice() {
    let activity_id = this.data.treasure.id
    this.setData({
      refuse: false
    })
    wx.navigateTo({
      url: `/pages/goPayment/treasure?activity_id=${activity_id}`
    })
  },

  // 立即免费领
  goBuy() {
    const that = this
    let activity_id = that.data.treasure.id
    let store_id = that.data.store_id
    netWorkComm.netWork({
      url: 'user/User/getTreasure',
      method: 'POST',
      para: {
        store_id: store_id
      },
      success(res) {
        let count = res.data.data.count
        let bought = res.data.data.bought
        that.setData({
          refuse: false
        })
        if (bought) {
          if (count > 0) {
            that.setData({
              refuse: true
            })
          } else {
            that.setData({
              codes: true
            })
          }
        } else {
          if (count > 0) {
            wx.navigateTo({
              url: `/pages/goPayment/treasure?activity_id=${activity_id}`,
            })
          } else {
            that.setData({
              codes: true
            })
          }
        }
      }
    })
    // if(token)
  },

  // 店铺首页
  goStore() {
    let store_id = this.data.treasure.store_id
    wx.navigateTo({
      url: `../goStore/index?store_id=${store_id}`,
    })
  },

  // 首页
  goIndex() {
    wx.redirectTo({
      url: '/pages/index/index',
    })
  },


  // 服务政策
  goService() {
    this.setData({
      service: !this.data.service
    })
  },

  // 商品参数
  goParameter() {
    this.setData({
      parameter: !this.data.parameter
    })
  },

  // 客服
  goCustomer() {
    this.setData({
      customer: !this.data.customer
    })
  },

  // 兑换券
  goChange() {
    this.setData({
      change: !this.data.change
    })
  },

  // 立即免费领
  bindgetuserinfo(e) {
    const that = this;
    let activity_id = that.data.treasure.id
    let iv = e.detail.iv
    let encryptedData = e.detail.encryptedData
    let head_pic = e.detail.userInfo.avatarUrl
    let nickName = e.detail.userInfo.nickName
    // if (e.detail.userInfo) {
    //   netWorkComm.netWork({
    //     para: {
    //       code: that.data.code,
    //       signature: e.detail.signature,
    //       rawData: e.detail.rawData,
    //       encryptedData: e.detail.encryptedData,
    //       iv: e.detail.iv
    //     },
    //     method: "POST",
    //     success(res) {
    //       console.log('授权登录')
    //       console.log(res)
    //       let openId = res.data.data.three_user.openId
    //       let unionId = res.data.data.three_user.unionId
    //       let head_pic = res.data.data.three_user.avatarUrl
    //       let nickName = res.data.data.three_user.nickName
    //       wx.navigateTo({
    //         url: `/pages/goPayment/treasure?activity_id=${activity_id}&openId=${openId}&unionId=${unionId}&head_pic=${head_pic}&nickName=${nickName}`,
    //       })
    //     }
    //   })
    //   //授权成功后,通过改变 isHide 的值，让实现页面显示出来，把授权页面隐藏起来
    // } else {
    //   //用户按了拒绝按钮
    //   wx.showModal({
    //     title: '警告',
    //     content: '您点击了拒绝授权，将无法进行免费领，请授权之后再进入!!!',
    //     showCancel: false,
    //     confirmText: '返回授权'
    //   })
    // }
    wx.login({
      success(res) {
        code: res.code
        netWorkComm.netWork({
          url: 'user/ThreeUser/miniLogin',
          method: 'POST',
          para: {
            code: that.data.code,
            signature: e.detail.signature,
            rawData: e.detail.rawData,
            encryptedData: e.detail.encryptedData,
            iv: e.detail.iv
          },
          success(res) {
            console.log('授权登录')
            console.log(res)
            let openId = res.data.data.three_user.openId
            let unionId = res.data.data.three_user.unionId
            let head_pic = res.data.data.three_user.avatarUrl
            let nickName = res.data.data.three_user.nickName
            wx.navigateTo({
              url: `/pages/goPayment/treasure?activity_id=${activity_id}&openId=${openId}&unionId=${unionId}&head_pic=${head_pic}&nickName=${nickName}`,
            })
          }
        })
      }
    })
  },

  // 第一次长链接
  goSocket() {
    const that = this
    SocketTask=wx.connectSocket({
      url: Config.SocketUrl,
      method: 'GET',
      success: function(res) {
        console.log(res)
      }
    })
    SocketTask.onOpen(res => {
      let old_data = {
        type: "join_activity",
        activity_id: that.data.activity_id
      }
      let new_data = JSON.stringify(old_data)
      wx.sendSocketMessage({
        data: new_data
      })
      // socketOpen = true;
      console.log('WebSocket1连接打开-----。', res)
    })
    SocketTask.onMessage(res => {
      let obj1 = JSON.parse(res.data)
      if (obj1.type == 'reply_order') {
        console.log(obj1)
        let objs1 = [];
        obj1.data.map(((item, index) => {
          objs1.push(Object.assign({}, item, {
            ty: false
          }))
        }))
        console.log(objs1)
        that.setData({
          obj: objs1
        })
      } else if (obj1.type == 'push_order') {
        let objs1 = [];
        obj1.data.map(((item, index) => {
          objs1.push(Object.assign({}, item, {
            ty: false
          }))
        }))
        that.setData({
          obj: objs1
        })
      }
      console.log('服务器返回的消息1', res)
    })
  },

  // toChange(e) {
  //   const that = this
  //   let orderId = e.currentTarget.dataset.id
  //   that.setData({
  //     orderId: orderId
  //   })
  //   this.toSocket()
  // },

  // 第二次长链接
  toSocket(e) {
    let orderId = e.currentTarget.dataset.id
    console.log(orderId)
    SocketTask2 = wx.connectSocket({
      url: Config.SocketUrl,
      success(res) {
        console.log(res)
      }
    })
    SocketTask2.onOpen(res => {
      let old_data = `{
        "type": "join_spike_order",
        "order_id": "${orderId}"
      }`
      wx.sendSocketMessage({
        data: old_data
      })
      // socketOpen = true;
      console.log('WebSocket2连接打开-----。', res)
    })
    SocketTask.onMessage(res => {
      let objs = JSON.parse(res.data)
      console.log(objs)
      if (objs.type == 'reply_order') {
        that.setData({
          obj2: objs.data
        })
      }
      console.log('服务器返回的消息2', res)
    })
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
    const that = this
    that.setData({
      token: wx.getStorageSync('token')
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    wx.closeSocket(() => {
      console.log(1)
    })
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

  },

})