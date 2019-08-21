const netWorkComm = require("../../utils/network.js")
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    maskFlag: false,
    service: false,
    parameter: false,
    customer: false,
    show: false,
    collection: true,
    change: false,
    showView: false,
    share: false,
    num: 1,
    index: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showLoading({
      title: '正在加载...',
    })
    console.log('分享码')
    console.log(options)
    console.log(options.from_order_sn)
    if (options.share_number) {
      wx.setStorageSync('invitation_type', options.invitation_type)
      wx.setStorageSync('parent_id', options.parent_id)
      wx.setStorageSync('register_scene', options.register_scene)
      wx.setStorageSync('share_number', options.share_number)
      wx.setStorageSync('from_order_sn', options.from_order_sn)
    }
    const that = this
    that.setData({
      activity_id: options.activity_id,
      options
    })
    that.getInfo()
    if (!wx.getStorageSync('token')) {
      wx.login({
        success: res => {
          netWorkComm.netWork({
            url: "user/ThreeUser/miniLoginByCode",
            para: {
              code: res.code
            },
            method: 'POST',
            success(res) {
              console.log(res)
              if (res.data.data.three_user) {
                wx.setStorageSync('token', "")
                that.getHomeData()
              } else if (res.data.data.user) {
                wx.setStorageSync('token', res.data.data.user.token)
                that.getHomeData()
              }
            }
          })
        }
      })
    } else {
      that.getHomeData()
    }
  },

  getHomeData() {
    const that = this
    netWorkComm.netWork({
      url: 'index_modular/IndexShow/getActivityInfo',
      para: {
        activity_id: options.activity_id
      },
      success(res) {
        let store_nice = res.data.data.store.store_cover.filter((item, index) => {
          return (index == 0)
        })
        console.log('清仓详情',res)
        let product_info = res.data.data.goods.product_info.replace(/<img/g, '<img lazy-load')
        that.setData({
          treasure: res.data.data,
          is_collection: res.data.data.is_collection,
          // time: res.data.data.has_time,
          token: wx.getStorageSync('token'),
          price: res.data.data.group_buy_price,
          name: res.data.data.goods.product_name,
          text: product_info,
          store_nice,
        }, () => {
          that.canVas()
          that.storeInfo()
          that.comment()
          that.setData({
            show: true
          })
          wx.hideLoading()
        })
      }
    })
  },

  goShare() {
    this.setData({
      share: true
    })
  },

  // 店铺推荐
  storeInfo() {
    const that = this
    netWorkComm.netWork({
      url: 'index_modular/IndexShow/getCommonRecommendListV1',
      para: {
        store_id: that.data.treasure.store_id
      },
      success(res) {
        console.log('商品活动')
        console.log(res.data.data)
        let indexList = res.data.data.filter((item, index) => {
          return (index < 6)
        })
        that.setData({
          indexShow: indexList
        })
      }
    })
  },

  getInfo() {
    const that = this
    wx.getSystemInfo({
      success: function(res) {
        console.log(res)
        let pixe = res.windowWidth / 375
        let myCanvasWidth = res.windowWidth
        let myCanvasHeight = myCanvasWidth * 4 / 5
        let modelX = res.model.indexOf("iPhone X")
        console.log(res)
        console.log(modelX)
        that.setData({
          canvasWidth: myCanvasWidth,
          canvasHeight: myCanvasHeight,
          pixe,
          modelX
        })
      },
    })
  },

  // 画布
  canVas() {
    const that = this
    let detail = that.data.treasure
    let pixe = that.data.pixe
    let price = detail.group_buy_price - 0
    let old_price = detail.origin_price - 0
    let cover_image = that.data.treasure.goods.product_img[0].url.replace('http://file.zhuangxiumall.cn', 'https://api.zhuangxiumall.cn')
    wx.getImageInfo({
      src: cover_image,
      success(res) {
        let cover_text = `本活动商品由${detail.store.brand}(深圳)提供`
        let cx = wx.createCanvasContext('canvas')
        cx.save();
        cx.drawImage(res.path, 0, 0, 750 * pixe / 2, 600 * pixe / 2)
        cx.drawImage('/images/img_smallroutine_rectangle@2x.png', 0, 411 * pixe / 2, 750 * pixe / 2, 189 * pixe / 2)
        cx.drawImage('/images/ic_smallroutine_yang@2x.png', 36 * pixe / 2, 486 * pixe / 2, 57 * pixe / 2, 57 * pixe / 2)
        cx.drawImage('/images/img_smallroutine1@2x.png', 500 * pixe / 2, 0, 250 * pixe / 2, 93 * pixe / 2)
        cx.setFontSize(56 * pixe / 2)
        cx.setFillStyle('#FF6632')
        cx.fillText('￥', 101 * pixe / 2, 534 * pixe / 2)
        cx.setFontSize(86 * pixe / 2)
        cx.setFillStyle('#FF6632')
        cx.fillText(price, 150 * pixe / 2, 534 * pixe / 2)
        cx.setFontSize(45 * pixe / 2)
        cx.setFillStyle('#fff')
        cx.setStrokeStyle('white')
        if (price > 1000) {
          cx.fillText(`￥${old_price}`, 350 * pixe / 2, 529 * pixe / 2)
          cx.moveTo(350 * pixe / 2, 510 * pixe / 2)
          if (old_price < 100) {
            cx.lineTo(450 * pixe / 2, 514 * pixe / 2)
          } else if (old_price < 1000) {
            cx.lineTo(480 * pixe / 2, 514 * pixe / 2)
          } else if (old_price < 10000) {
            cx.lineTo(510 * pixe / 2, 514 * pixe / 2)
          } else if (old_price < 100000) {
            cx.lineTo(540 * pixe / 2, 514 * pixe / 2)
          }
        } else {
          cx.fillText(`￥${old_price}`, 312 * pixe / 2, 529 * pixe / 2)
          cx.moveTo(312 * pixe / 2, 510 * pixe / 2)
          if (old_price < 100) {
            cx.lineTo(410 * pixe / 2, 514 * pixe / 2)
          } else if (old_price < 1000) {
            cx.lineTo(440 * pixe / 2, 514 * pixe / 2)
          } else if (old_price < 10000) {
            cx.lineTo(470 * pixe / 2, 514 * pixe / 2)
          } else if (old_price < 100000) {
            cx.lineTo(500 * pixe / 2, 514 * pixe / 2)
          }
        }
        cx.stroke()
        cx.setFontSize(29 * pixe / 2)
        cx.setFillStyle('#fff')
        cx.fillText(cover_text, 36 * pixe / 2, 580 * pixe / 2)
        cx.draw(true, setTimeout(function() {
          wx.canvasToTempFilePath({
            canvasId: 'canvas',
            success: function(res) {
              console.log('画布图片')
              console.log(res.tempFilePath)
              that.setData({
                shareImage: res.tempFilePath
              })
            }
          })
        }, 500))
      }
    })
  },

  // 放大轮播图
  goSwiper(e) {
    let itemUrl = e.currentTarget.dataset.itemurl
    let items = []
    this.data.treasure.goods.product_img.forEach(item => {
      items.push(item.url)
    })
    wx.previewImage({
      urls: items,
      current: itemUrl
    })
  },

  // 分享图制作中
  goToast() {
    wx.showToast({
      title: '您点的太快啦！',
      icon: 'none'
    })
  },

  // 滚动穿透
  preventMove() {
    return
  },

  // 无效点击
  goClick() {
    return
  },

  // 关闭所有
  goAll() {
    this.setData({
      maskFlag: false,
      service: false,
      change: false,
      parameter: false,
      customer: false,
      share: false
    })
  },


  // 评论
  comment() {
    const that = this
    let activity_id = that.data.treasure.id
    // 评论列表
    netWorkComm.netWork({
      url: 'group_buy_modular/Comment/getUserCommentList',
      para: {
        is_self: '0',
        activity_id: activity_id
      },
      success(res) {
        wx.hideLoading()
        that.setData({
          follow: res.data.data,
          page_size: res.data.count
        })
      }
    })
  },

  // 全部评价
  goEvaluate() {
    const that = this
    let activity_id = that.data.treasure.id
    let page_size = that.data.page_size
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/goStore/evaluate?activity_id=${activity_id}&page_size=${page_size}`,
      })
    }
    app.but()
  },

  // 首页
  goIndex() {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },

  // 打电话
  goIphon() {
    const that = this
    if (app.globalData.but) {
      wx.makePhoneCall({
        phoneNumber: that.data.treasure.store.mobile
      })
    }
    app.but()
  },

  // 打客服
  goIphons(e) {
    const that = this
    let mobile = e.currentTarget.dataset.mobile
    if (app.globalData.but) {
      wx.makePhoneCall({
        phoneNumber: mobile
      })
    }
    app.but()
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

        }
      })
    }
  },

  // 服务政策
  goService() {
    this.setData({
      service: true,
      showView: true
    })
  },

  // 商品参数
  goParameter() {
    this.setData({
      parameter: true,
      showView: true
    })
  },

  // 客服
  goCustomer() {
    this.setData({
      customer: true,
      showView: true
    })
  },

  // 兑换券说明
  goChange() {
    this.setData({
      change: true,
      showView: true
    })
  },

  goGoods(e) {
    console.log(e)
    let activity_id = e.currentTarget.dataset.item.data.activity_id
    let type = e.currentTarget.dataset.item.type
    if (app.globalData.but) {
      if (type == 'spike') {
        wx.navigateTo({
          url: `/pages/details/treasure?activity_id=${activity_id}`,
        })
      } else if (type == 'group_buy') {
        wx.navigateTo({
          url: `/pages/details/assemble?activity_id=${activity_id}`,
        })
      } else if (type == 'temai') {
        wx.navigateTo({
          url: `/pages/details/sample?activity_id=${activity_id}`,
        })
      }
    }
    app.but()
  },

  //商家信息
  goStore() {
    let store_id = this.data.treasure.store_id
    if (app.globalData.but) {
      wx.navigateTo({
        url: `../goStore/index?store_id=${store_id}`,
      })
    }
    app.but()
  },

  // 授权登录
  bindgetuserinfo2(e) {
    const that = this
    let activity_id = that.data.activity_id
    if(app.globalData.but) {
      if (e.detail.userInfo) {
        wx.login({
          success(res) {
            let code = res.code
            netWorkComm.netWork({
              url: 'user/ThreeUser/miniLogin',
              method: 'POST',
              para: {
                code: code,
                signature: e.detail.signature,
                rawData: e.detail.rawData,
                encryptedData: e.detail.encryptedData,
                iv: e.detail.iv
              },
              success(res) {
                let openId = res.data.data.three_user.openId
                let unionId = res.data.data.three_user.unionId
                let head_pic = res.data.data.three_user.avatarUrl
                let nickName = res.data.data.three_user.nickName
                wx.navigateTo({
                  url: `/pages/goSample/sample?openId=${openId}&unionId=${unionId}&head_pic=${head_pic}&nickName=${nickName}&activity_id=${activity_id}`,
                })
              }
            })
          }
        })
      } else {
        wx.showToast({
          title: '未授权',
          icon: 'none'
        })
      }
    }
    app.but()
  },

  // 立即抢购
  goAssemble() {
    let activity_id = this.data.activity_id
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/goClearance/goBuy?activity_id=${activity_id}`,
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
    const that = this
    this.setData({
      token: wx.getStorageSync('token'),
      orderLength: app.globalData.orderLength
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    const that = this
    that.setData({
      share: false
    })
    if (that.data.options.vestStatus == '1') {
      let options = that.data.options
      return {
        title: `深圳${that.data.treasure.store.brand}独家放送，${that.data.treasure.goods.category_name}拼团只需${that.data.price - 0}！`,
        imageUrl: that.data.shareImage,
        // path: `/pages/details/clearance?activity_id=${that.data.treasure.id}`
        path: `/pages/details/clearance?activity_id=${that.data.treasure.id}&invitation_type=${options.invitation_type}&parent_id=${options.parent_id}&register_scene=${options.register_scene}&share_number=${options.share_number}`
      }
    } else {
      return {
        title: `深圳${that.data.treasure.store.brand}独家放送，${that.data.treasure.goods.category_name}拼团只需${that.data.price - 0}！`,
        imageUrl: that.data.shareImage,
        // path: `/pages/details/clearance?activity_id=${that.data.treasure.id}`
        path: `/pages/index/index?activity_id=${that.data.treasure.id}&share_num=${'clearance'}`
      }
    }
  }
})