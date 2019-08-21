const netWorkComm = require("../../utils/network.js")
import animation from '../../utils/animation.js'
const app = getApp()
let tickers = []

Page({
  // ..animation.
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
    dynamic: true,
    num: 1,
    index: 0,
    timeOut: '',
    animationData: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const that = this
    wx.showLoading({
      title: '正在加载...',
    })
    console.log('携带参数',options)
    if (options.scene) {
      const scene = decodeURIComponent(options.scene)
      console.log('转化scene', scene)
      netWorkComm.netWork({
        url: 'index_modular/IndexShow/getShareInfo',
        para: {
          share_id: scene
        },
        success(res) {
          console.log('扫码进',res)
          that.getInfo()
          that.setData({
            activity_id: res.data.data.activity_id,
            options: res.data.data
          })
          let options = res.data.data
          if (options.share_number) {
            wx.setStorageSync('invitation_type', options.invitation_type)
            wx.setStorageSync('parent_id', options.parent_id)
            wx.setStorageSync('register_scene', options.register_scene)
            wx.setStorageSync('share_number', options.share_number)
            wx.setStorageSync('from_order_sn', options.from_order_sn)
            if (wx.getStorageSync('token')) {
              netWorkComm.netWork({
                url: 'order_modular/Order/queryShareOrder',
                para: {
                  share_number: options.share_number,
                  activity_id: options.activity_id
                },
                success(res) {
                  let item = res.data.data.order
                  console.log('跳转', res)
                  if (item) {
                    if (item.type == '3') {
                      wx.navigateTo({
                        url: `/pages/goPayment/help?order_sn=${item.order_sn}`,
                      })
                    } else if (item.type == '2') {
                      wx.navigateTo({
                        url: `/pages/goAssemble/groubInfo?id=${item.id}&record_id=${item.record_id}`,
                      })
                    }
                  }
                }
              })
            }
          }
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
        }
      })
    } else {
      if (options.share_number) {
        wx.setStorageSync('invitation_type', options.invitation_type)
        wx.setStorageSync('parent_id', options.parent_id)
        wx.setStorageSync('register_scene', options.register_scene)
        wx.setStorageSync('share_number', options.share_number)
        wx.setStorageSync('from_order_sn', options.from_order_sn)
        if (wx.getStorageSync('token')) {
          netWorkComm.netWork({
            url: 'order_modular/Order/queryShareOrder',
            para: {
              share_number: options.share_number,
              activity_id: options.activity_id
            },
            success(res) {
              let item = res.data.data.order
              console.log('跳转', res)
              if (item) {
                if (item.type == '3') {
                  wx.navigateTo({
                    url: `/pages/goPayment/help?order_sn=${item.order_sn}`,
                  })
                } else if (item.type == '2') {
                  wx.navigateTo({
                    url: `/pages/goAssemble/groubInfo?id=${item.id}&record_id=${item.record_id}`,
                  })
                }
              }
            }
          })
        }
      }
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
    }
  },

  goShare() {
    this.setData({
      share: true
    })
  },

  getHomeData() {
    const that = this
    wx.showLoading({
      title: '正在加载...',
    })
    netWorkComm.netWork({
      url: 'index_modular/IndexShow/getActivityInfo',
      para: {
        activity_id: that.data.activity_id,
        activity_type: '1'
      },
      success(res) {
        console.log('商品详情')
        console.log(res)
        let store_nice = res.data.data.store.store_cover.filter((item, index) => {
          return (index == 0)
        })
        let product_info = res.data.data.goods.product_info.replace(/<img/g, '<img lazy-load')
        that.setData({
          treasure: res.data.data,
          is_collection: res.data.data.is_collection,
          time: res.data.data.has_time,
          token: wx.getStorageSync('token'),
          price: res.data.data.group_buy_price,
          direct_price: res.data.data.direct_price,
          name: res.data.data.goods.product_name,
          text: product_info,
          store_nice,
        }, () => {
          that.countDown()
          that.canVas()
          that.storeInfo()
          that.comment()
          that.setData({
            show: true
          })
          wx.hideLoading()
          wx.stopPullDownRefresh()
        })
      }
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

  goList(e) {
    console.log(e)
    if (app.globalData.but) {
      let record_id = e.currentTarget.dataset.item.id
      wx.navigateTo({
        url: `/pages/goAssemble/groubInfo?record_id=${record_id}`,
      })
    }
    app.but()
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
        cx.drawImage('/images/ic_smallroutine_group@2x.png', 36 * pixe / 2, 486 * pixe / 2, 50 * pixe / 2, 50 * pixe / 2)
        cx.drawImage('/images/img_smallroutine1@2x.png', 500 * pixe / 2, 0, 250 * pixe / 2, 93 * pixe / 2)
        cx.setFontSize(56 * pixe / 2)
        cx.setFillStyle('#F8524E')
        cx.fillText('￥', 101 * pixe / 2, 534 * pixe / 2)
        cx.setFontSize(86 * pixe / 2)
        cx.setFillStyle('#F8524E')
        cx.fillText(price, 150 * pixe / 2, 534 * pixe / 2)
        cx.setFontSize(45 * pixe / 2)
        cx.setFillStyle('#fff')
        cx.setStrokeStyle('white')
        if (price < 1000) {
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
        } else if (price < 10000) {
          cx.fillText(`￥${old_price}`, 360 * pixe / 2, 529 * pixe / 2)
          cx.moveTo(360 * pixe / 2, 510 * pixe / 2)
          if (old_price < 100) {
            cx.lineTo(460 * pixe / 2, 514 * pixe / 2)
          } else if (old_price < 1000) {
            cx.lineTo(490 * pixe / 2, 514 * pixe / 2)
          } else if (old_price < 10000) {
            cx.lineTo(520 * pixe / 2, 514 * pixe / 2)
          } else if (old_price < 100000) {
            cx.lineTo(550 * pixe / 2, 514 * pixe / 2)
          }
        } else if (price < 100000) {
          cx.fillText(`￥${old_price}`, 410 * pixe / 2, 529 * pixe / 2)
          cx.moveTo(410 * pixe / 2, 510 * pixe / 2)
          if (old_price < 100) {
            cx.lineTo(510 * pixe / 2, 514 * pixe / 2)
          } else if (old_price < 1000) {
            cx.lineTo(540 * pixe / 2, 514 * pixe / 2)
          } else if (old_price < 10000) {
            cx.lineTo(570 * pixe / 2, 514 * pixe / 2)
          } else if (old_price < 100000) {
            cx.lineTo(600 * pixe / 2, 514 * pixe / 2)
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
    if (app.globalData.but) {
      wx.previewImage({
        urls: items,
        current: itemUrl
      })
    }
    app.but()
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

  // 查看全部
  showAll() {
    this.setData({
      dynamic: true
    })
  },

  // 关闭所有
  goAll() {
    this.setData({
      maskFlag: false,
      service: false,
      change: false,
      parameter: false,
      customer: false,
      share: false,
      dynamic: false
    })
  },

  goOrder() {
    if (app.globalData.but) {
      let orderStatus = app.globalData.orderStatus
      console.log(orderStatus)
      if (orderStatus.type == 'spike') {
        wx.navigateTo({
          url: `/pages/goPayment/help?order_sn=${orderStatus.order.order_sn}`,
        })
      } else if (orderStatus.type == "group_buy") {
        wx.navigateTo({
          url: `/pages/goAssemble/groubInfo?id=${orderStatus.order.id}&record_id=${orderStatus.order.record_id}`,
        })
      } else if (orderStatus.type == 'group_buy_direct') {
        wx.navigateTo({
          url: `/pages/goAssemble/direct?id=${orderStatus.order.id}`,
        })
      }
    }
    app.but()
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
        console.log(res.data.data)
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
    wx.navigateTo({
      url: `/pages/goStore/evaluate?activity_id=${activity_id}&page_size=${page_size}`,
    })
  },

  // 倒计时
  countDown(time) {
    const that = this
    let countDownNum = that.data.time
    that.setData({
      countDownNum
    })
    if (countDownNum > 0 && countDownNum < 86401) {
      let timeOut = setInterval(() => {
        countDownNum--;
        that.setData({
          countDownNum
        })
        if (that.data.countDownNum == 0) {
          clearInterval(timeOut)
        }
      }, 1000)
      that.setData({
        timeOut
      })
    } else {
      that.setData({
        countDownNum
      })
    }
  },

  // 加
  addNum() {
    let num = this.data.num + 1
    this.setData({
      num
    })
  },

  // 减
  delNum() {
    let num = this.data.num - 1
    this.setData({
      num
    })
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
    wx.makePhoneCall({
      phoneNumber: mobile
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
      showView: true,
      service: true,
    })
  },

  // 商品参数
  goParameter() {
    this.setData({
      showView: true,
      parameter: true,
    })
  },

  // 兑换券说明
  goChange() {
    this.setData({
      showView: true,
      change: true,
    })
  },

  // 客服
  goCustomer() {
    this.setData({
      showView: true,
      customer: true,
    })
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

  // 直购
  directBuy() {
    this.setData({
      showView: true,
      maskFlag: true
    })
  },

  // 提交订单
  goDirect() {
    const that = this
    let direct_price = that.data.direct_price * that.data.num
    let name = that.data.name
    console.log('直购分享码')
    console.log(wx.getStorageSync('from_order_sn'))
    console.log(wx.getStorageSync('share_number'))
    if (app.globalData.but) {
      netWorkComm.netWork({
        url: 'group_buy_modular/ActivityGroupBuyOrder/addDirectOrder',
        method: 'POST',
        para: {
          activity_id: that.data.activity_id,
          num: that.data.num,
          invitation_type: wx.getStorageSync('invitation_type'),
          parent_id: wx.getStorageSync('parent_id'),
          register_scene: wx.getStorageSync('register_scene'),
          share_number: wx.getStorageSync('share_number'),
          from_order_sn: wx.getStorageSync('from_order_sn'),
        },
        success(res) {
          console.log('直购提交')
          console.log(res.data.data)
          let id = res.data.data.id
          let order_sn = res.data.data.order_sn
          wx.navigateTo({
            url: `../goPayment/treasurePay?new_price=${direct_price}&product_name=${name}&id=${id}&buy_type=${1}&order_sn=${order_sn}`,
          })
          that.setData({
            maskFlag: false
          })
        }
      })
    }
    app.but()
  },

  // 授权登录
  bindgetuserinfo2(e) {
    const that = this
    if (app.globalData.but) {
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
                let activity_id = that.data.activity_id
                wx.navigateTo({
                  url: `/pages/goAssemble/goBuy?openId=${openId}&unionId=${unionId}&head_pic=${head_pic}&nickName=${nickName}&activity_id=${activity_id}`,
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

  bindgetuserinfo1(e) {
    const that = this
    if (app.globalData.but) {
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
                that.setData({
                  showView: true,
                  maskFlag: true,
                  openId,
                  unionId,
                  head_pic,
                  nickName
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

  // 一键开团
  goAssemble() {
    let activity_id = this.data.activity_id
    if (app.globalData.but) {
      wx.navigateTo({
        url: `../goAssemble/goBuy?activity_id=${activity_id}`,
      })
    }
    app.but()
  },

  // 绑定手机号
  getPhoneNumber(e) {
    const that = this
    console.log(e)
    if (e.detail.iv) {
      netWorkComm.netWork({
        url: 'user/ThreeUser/miniBind',
        method: 'POST',
        para: {
          open_id: that.data.openId,
          union_id: that.data.unionId,
          ot: 'wx',
          head_pic: that.data.head_pic,
          nickname: that.data.nickName,
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
          that.goDirect()
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
    const that = this
    that.setData({
      token: wx.getStorageSync('token'),
      orderLength: app.globalData.orderLength,
    })
    if (wx.getStorageSync('token')) {
      app.getList()
    }
    netWorkComm.netWork({
      url: 'index_modular/IndexShow/getGroupBuyRecordList',
      para: {
        activity_id: that.data.activity_id
      },
      success(res) {
        console.log('动态', res)
        if (res.data.data) {
          let orderTime = res.data.data
          orderTime.forEach((item, index) => {
            if (item.status == 0) {
              item.time = item.has_time
              let timeOut1 = setInterval(() => {
                item.time--;
                that.setData({
                  dynamicList: orderTime
                })
                if (item.time == 0) {
                  clearInterval(timeOut1)
                }
              }, 1000)
              tickers.push(timeOut1)
            }
          })
          that.setData({
            dynamicList: res.data.data
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    app.globalData.but = true
    clearInterval(this.data.timeOut)
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
    clearInterval(this.data.timeOut)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.getHomeData()
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
        title: that.data.treasure.share_template ? that.data.treasure.share_template.main_title : `深圳${that.data.treasure.store.brand}独家放送，${that.data.treasure.goods.category_name}拼团只需${that.data.price - 0}！`,
        imageUrl: that.data.shareImage,
        path: `/pages/details/assemble?activity_id=${that.data.treasure.id}&invitation_type=${wx.getStorageSync('invitation_type')}&parent_id=${wx.getStorageSync('parent_id')}&register_scene=${wx.getStorageSync('register_scene')}&share_number=${wx.getStorageSync('share_number')}`
      }
    } else {
      return {
        title: that.data.treasure.share_template ? that.data.treasure.share_template.main_title : `深圳${that.data.treasure.store.brand}独家放送，${that.data.treasure.goods.category_name}拼团只需${that.data.price - 0}！`,
        imageUrl: that.data.shareImage,
        path: `/pages/index/index?activity_id=${that.data.treasure.id}&share_num=${'assemble'}`
      }
    }
  }
})