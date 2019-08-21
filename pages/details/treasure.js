const app = getApp()
const netWorkComm = require("../../utils/network.js")
let SocketTask, SocketTask2;
const Config = require('../../utils/config.js')
let socketOpen = true

Page({

  /**
   * 页面的初始数据
   */
  data: {
    service: false,
    parameter: false,
    showView: false,
    customer: false,
    collection: true,
    refuse: false,
    codes: false,
    show: false,
    hideIcon: true,
    showAll: true,
    shareType: false,
    dynamic: false,
    socket: false,
    share: false,
    vest: false,
    timeOut: '',
    socketNum: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const that = this
    wx.showLoading({
      title: '正在加载...',
    })
    console.log('携带参数', options)
    if (options.scene) {
      const scene = decodeURIComponent(options.scene)
      console.log('转化scene', scene)
      netWorkComm.netWork({
        url: 'index_modular/IndexShow/getShareInfo',
        para: {
          share_id: scene
        },
        success(res) {
          console.log('扫码进', res)
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
      that.getInfo()
      that.setData({
        activity_id: options.activity_id,
        options
      })
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

  getHomeData() {
    const that = this
    netWorkComm.netWork({
      url: 'spike_modular/Home/getSpikeInfo',
      para: {
        activity_id: that.data.activity_id
      },
      success(res) {
        console.log('免费领详情', res)
        let product_info = res.data.data.goods.product_info.replace(/<img/g, '<img lazy-load')
        that.setData({
          token: wx.getStorageSync('token'),
          treasure: res.data.data,
          activity_id: res.data.data.goods.activity_id,
          is_collection: res.data.data.is_collection,
          name: res.data.data.store.brand,
          newPrice: res.data.data.group_buy_price,
          oldPrice: res.data.data.origin_price,
          stock: res.data.data.stock,
          bar: res.data.data.progress_bar * 100,
          store_id: res.data.data.store_id,
          text: product_info,
          time: res.data.data.difference_time
        }, () => {
          that.canVas()
          that.storeInfo()
          that.countDown()
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

  // 砍价帮数据
  getSpike() {
    const that = this
    netWorkComm.netWork({
      url: 'spike_modular/Home/getSpikeOrderList',
      para: {
        activity_id: that.data.activity_id
      },
      success(res) {
        console.log('砍价帮数据')
        console.log(res.data.data)
        that.setData({
          obj: res.data.data
        })
      }
    })
  },

  // 砍价帮数据
  goList(e) {
    const that = this
    let order_id = e.currentTarget.dataset.id
    let itemObj = e.currentTarget.dataset.item
    netWorkComm.netWork({
      url: 'spike_modular/Home/getSpikeOrderLike',
      para: {
        order_id: order_id
      },
      success(res) {
        console.log('具体砍价人')
        console.log(res.data)
        that.setData({
          itemObj,
          count_likes: itemObj.need_num - itemObj.count_likes,
          obj2: res.data,
          dynamic: true,
        })
      }
    })
  },

  getInfo() {
    const that = this
    wx.getSystemInfo({
      success: function(res) {
        let pixe = res.windowWidth / 750
        let myCanvasWidth = res.windowWidth
        let myCanvasHeight = myCanvasWidth * 4 / 5
        let modelX = res.model.indexOf("iPhone X")
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
    let price = detail.group_buy_price - 0
    let old_price = detail.origin_price - 0
    let num = detail.stock - detail.sold - detail.frozen_num
    let cover_image = detail.goods.product_img[0].url.replace('http://file.zhuangxiumall.cn', 'https://api.zhuangxiumall.cn')
    let pixe = that.data.pixe
    // let progress_bar = detail.progress_bar
    // console.log(progress_bar)
    wx.getImageInfo({
      src: cover_image,
      success(res) {
        let cover_text = `本活动商品由${detail.store.brand}(深圳)特约赞助`
        let cx = wx.createCanvasContext('canvas')
        cx.save();
        cx.drawImage(res.path, 0, 0, 750 * pixe, 600 * pixe)
        cx.drawImage('/images/img_smallroutine_rectangle@2x.png', 0, 411 * pixe, 750 * pixe, 189 * pixe)
        cx.drawImage('/images/ic_smallroutine_new@2x.png', 0, 0, 236 * pixe, 93 * pixe)
        cx.drawImage('/images/img_pmgressbar2@2x.png', 286 * pixe, 496 * pixe, 261 * pixe, 25 * pixe)
        // cx.drawImage('/images/img_pmgressbar2@2x.png', 286 * pixe + 261 * progress_bar * pixe, 496 * pixe, 261 * (1 - progress_bar) * pixe, 25 * pixe)
        cx.setFontSize(56 * pixe)
        cx.setFillStyle('#FFBE4D')
        cx.fillText('￥', 36 * pixe, 511 * pixe)
        cx.setFontSize(100 * pixe)
        cx.setFillStyle('#FFBE4D')
        cx.fillText('0.01', 82 * pixe, 511 * pixe)
        cx.setFontSize(45 * pixe)
        cx.setFillStyle('#fff')
        cx.fillText(`￥${old_price}`, 286 * pixe, 471 * pixe)
        cx.setStrokeStyle('white')
        cx.moveTo(286 * pixe, 451 * pixe)
        if (old_price < 10) {
          cx.lineTo(365 * pixe, 455 * pixe)
        } else if (old_price < 100) {
          cx.lineTo(385 * pixe, 455 * pixe)
        } else if (old_price < 1000) {
          cx.lineTo(415 * pixe, 455 * pixe)
        } else if (old_price < 10000) {
          cx.lineTo(445 * pixe, 455 * pixe)
        } else if (old_price < 100000) {
          cx.lineTo(475 * pixe, 455 * pixe)
        }
        cx.stroke()
        cx.setFontSize(36 * pixe)
        cx.setFillStyle('#fff')
        cx.fillText(`限量${num}件`, 554 * pixe, 525 * pixe)
        cx.setFontSize(29 * pixe)
        cx.setFillStyle('#fff')
        cx.fillText(cover_text, 36 * pixe, 582 * pixe)
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

  // dianji() {
  //   this.canVas()
  //     , () => {
  //       let urls = [that.data.shareImage]
  //       console.log(urls)
  //       wx.previewImage({
  //         urls: urls,
  //         current: 'http://tmp/wx13c3cf71665d7d0d.o6zAJsxH3desdETdsCQAUwt6qIvA.5S6Dh2luM6YM20ff27b393cf29553daece5a029e39ec.png',
  //         success(res) {
  //         }
  //       })
  //     }
  // },

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
      refuse: false,
      codes: false,
      service: false,
      change: false,
      parameter: false,
      customer: false,
      dynamic: false,
      share: false,
      vest: false
    })
  },

  goShare() {
    this.setData({
      share: true
    })
  },

  goNone() {
    wx.showToast({
      title: '暂无动态',
      icon: 'none'
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
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/goStore/evaluate?activity_id=${activity_id}&page_size=${page_size}`,
      })
    }
    app.but()
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
        wx.hideLoading()
        console.log('评价列表')
        console.log(res)
        that.setData({
          follow: res.data.data,
          page_size: res.data.count,
          follows: true
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
        success(res) {}
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
        success(res) {}
      })
    }
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
    const that = this
    let treasure = that.data.treasure
    let activity_id = that.data.treasure.goods.activity_id
    if (app.globalData.but) {
      this.setData({
        refuse: false
      })
      wx.navigateTo({
        url: `/pages/goPayment/gobuy?price=${treasure.group_buy_price}&old_price=${treasure.origin_price}&name=${treasure.goods.product_name}&image=${treasure.goods.product_img[0].url}&id=${activity_id}`,
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

  // 店铺首页
  goStore() {
    let store_id = this.data.treasure.store_id
    if (app.globalData.but) {
      wx.navigateTo({
        url: `../goStore/index?store_id=${store_id}`,
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

  // 首页
  goIndex() {
    wx.switchTab({
      url: '/pages/index/index',
    })
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

  // 兑换券
  goChange() {
    this.setData({
      change: true,
      showView: true
    })
  },

  // 立即领取
  goBuy() {
    const that = this
    let activity_id = that.data.treasure.goods.activity_id
    let store_id = that.data.store_id
    if (app.globalData.but) {
      netWorkComm.netWork({
        url: 'user/User/getTreasure',
        method: 'POST',
        para: {
          store_id: store_id
        },
        success(res) {
          console.log('立即领取')
          console.log(res)
          let count = res.data.data.count
          let bought = res.data.data.bought
          let is_vest = res.data.data.is_vest
          console.log(bought)
          that.setData({
            refuse: false
          })
          if (!is_vest) {
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
                let treasure = that.data.treasure
                wx.navigateTo({
                  url: `/pages/goPayment/gobuy?price=${treasure.group_buy_price}&old_price=${treasure.origin_price}&name=${treasure.goods.product_name}&image=${treasure.goods.product_img[0].url}&id=${activity_id}`,
                })
              } else {
                that.setData({
                  codes: true
                })
              }
            }
          } else {
            that.setData({
              vest: true
            })
          }
        }
      })
    }
    app.but()
  },

  // 立即领取
  bindgetuserinfo(e) {
    const that = this;
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
                let id = that.data.treasure.goods.activity_id
                let treasure = that.data.treasure
                wx.navigateTo({
                  url: `/pages/goPayment/gobuy?id=${id}&openId=${openId}&unionId=${unionId}&head_pic=${head_pic}&nickName=${nickName}&price=${treasure.group_buy_price}&old_price=${treasure.origin_price}&name=${treasure.goods.product_name}&image=${treasure.goods.product_img[0].url}`,
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


  //发送消息
  sendMsgs(msg) {
    msg = JSON.stringify(msg)
    console.log('发送的消息', msg)
    wx.sendSocketMessage({
      data: msg,
    })
  },

  sendMsg: function(e) {
    const that = this
    console.log(that.data.activity_id)
    console.log("发送")
    if (socketOpen) {
      let msg = {
        type: "join_activity",
        activity_id: that.data.activity_id
      };
      this.sendMsgs(msg)
    } else {
      console.log("Socket未打开----检查配置")
    }
  },

  // 第一次长链接
  webSocket() {
    const that = this
    SocketTask = wx.connectSocket({
      url: Config.SocketUrl,
      success: function(res) {
        console.log('WebSocket连接创建', res)
      },
      fail: function(err) {
        wx.showToast({
          title: '网络异常！',
        })
        console.log(err)
      },
    })
    SocketTask.onOpen(res => {
      socketOpen = true
      console.log('WebSocket连接打开-----。', res)
      // that.sendMsg()
      let old_data = {
        type: "join_activity",
        activity_id: that.data.activity_id
      }
      let new_data = JSON.stringify(old_data)
      wx.sendSocketMessage({
        data: new_data
      })
    })
    SocketTask.onMessage(res => {
      let obj1 = JSON.parse(res.data)
      console.log('第一次长连接')
      console.log(obj1.data)
      if (obj1.type == 'reply_order') {
        that.setData({
          obj: obj1.data
        })
      } else if (obj1.type == 'push_order') {
        that.setData({
          obj: that.data.obj.concat(obj1.data)
        })
      }
      console.log('服务器返回的消息1', res)
    })
  },

  // 第二次长链接
  toSocket(e) {
    if (app.globalData.but) {
      app.globalData.but = false
      const that = this
      console.log(e)
      let orderId = e.currentTarget.dataset.id
      let itemObj = e.currentTarget.dataset.item
      that.setData({
        socket: true
      })
      console.log('第二次')
      console.log(itemObj)
      that.setData({
        itemObj,
        obj: that.data.obj
      })
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
        console.log('WebSocket2连接打开-----。', res)
      })
      SocketTask2.onMessage(res => {
        let objs = JSON.parse(res.data)
        console.log(objs)
        console.log(objs.data)
        if (objs.type == 'reply_like') {
          that.setData({
            obj2: objs,
            dynamic: true
          })

        } else if (objs.type == 'push_like') {
          that.setData({
            obj2: that.data.obj2.data.concat(objs.data)
          })
        }
        console.log('服务器返回的消息2', res)
      })
    }
    setTimeout(() => {
      app.globalData.but = true
    }, 300)
  },
  // onPageScroll(e) {
  //   if (this.data.socket) {
  //     SocketTask2.close()
  //   } else {
  //     return
  //   }
  // },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  // onReady: function(options) {
  //   console.log("-------------onReady------")
  //   console.log(socketOpen)
  //   if (socketOpen) {
  //     SocketTask.onMessage(onMessage => {
  //       console.log('服务器返回的消息', onMessage)
  //       // let obj1 = JSON.parse(onMessage.data)
  //       // console.log('第一次')
  //       // console.log(obj1)
  //       // if (obj1.type == 'reply_order') {
  //       //   let objs1 = [];
  //       //   console.log(obj1.data)
  //       //   obj1.data.map(((item, index) => {
  //       //     objs1.push(Object.assign({}, item, {
  //       //       ty: false
  //       //     }))
  //       //   }))
  //       //   console.log(objs1)
  //       //   that.setData({
  //       //     obj: objs1
  //       //   })
  //       // } else if (obj1.type == 'push_order') {
  //       //   let objs1 = [];
  //       //   console.log(obj1.data)
  //       //   obj1.data.map(((item, index) => {
  //       //     objs1.push(Object.assign({}, item, {
  //       //       ty: false
  //       //     }))
  //       //   }))
  //       //   console.log(objs1)
  //       //   that.setData({
  //       //     obj: objs1
  //       //   })
  //       // }
  //     })
  //     SocketTask.onClose(onClose => {
  //       console.log('WebSocket连接关闭----。', onClose)
  //     })
  //     SocketTask.onError(onError => {
  //       console.log('WebSocket错误-----', onError)
  //       this.webSocket()
  //     })
  //   }
  // },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    const that = this
    if (wx.getStorageSync('token')) {
      app.getList()
    }
    that.setData({
      token: wx.getStorageSync('token'),
      orderLength: app.globalData.orderLength
    })
    that.getSpike()
    netWorkComm.netWork({
      url: 'spike_modular/Home/getSpikeInfo',
      para: {
        activity_id: that.data.activity_id
      },
      success(res) {
        console.log('免费领详情')
        console.log(res)
        that.setData({
          treasure: res.data.data
        })
      }
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
        title: that.data.treasure.share_template ? that.data.treasure.share_template.main_title : `新人免费领！深圳${that.data.treasure.store.brand}独家放送！`,
        imageUrl: that.data.shareImage,
        // path: `/pages/details/treasure?activity_id=${that.data.activity_id}&share_num=${'treasure'}`,
        path: `/pages/details/treasure?activity_id=${that.data.activity_id}&invitation_type=${options.invitation_type}&parent_id=${options.parent_id}&register_scene=${options.register_scene}&share_number=${options.share_number}`,
      }
    } else {
      return {
        title: that.data.treasure.share_template ? that.data.treasure.share_template.main_title : `新人免费领！深圳${that.data.treasure.store.brand}独家放送！`,
        imageUrl: that.data.shareImage,
        // path: `/pages/details/treasure?activity_id=${that.data.activity_id}&share_num=${'treasure'}`,
        path: `/pages/index/index?activity_id=${that.data.activity_id}&share_num=${'treasure'}`,
      }
    }
  }
})