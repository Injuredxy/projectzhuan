const app = getApp()
const util = require('../../utils/util.js')
const netWorkComm = require("../../utils/network.js")
let tickers = []

Page({
  data: {
    // 导航栏数据
    category: {
      list: []
    },
    // 砍价推荐数据
    treasure: {
      list: []
    },
    // 精品推荐数
    recommend: {
      list: []
    },
    current: 0,
    // 根据分类获取活动商品列表
    show: false,
    firstIndex: true,
    indicatorDots: true,
    dots: true,
    page: 1,
    login: true,
    orderList: '',
    order: false,
    token: wx.getStorageSync('token')
  },

  launchAppError(e) {
    console.log(e)
    console.log(e.detail.errMsg)
    if (e.detail.errMsg == 'invalid scene') {
      wx.showToast({
        title: '请在聚装修App中打开',
        icon: 'none'
      })
    }
  },

  onLoad: function(options) {
    const that = this
    that.setData({
      options
    })
    wx.hideTabBar()
    that.getInfo()
    if (that.options.share_num) {
      that.goGoods()
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
                wx.getLocation({
                  success: function(res) {
                    wx.setStorageSync('lat', res.latitude)
                    wx.setStorageSync('lng', res.longitude)
                  },
                  complete() {
                    that.setData({
                      location: true
                    })
                  }
                })
                that.getHomeData()
              } else if (res.data.data.user) {
                that.setData({
                  location: true
                })
                wx.setStorageSync('token', res.data.data.user.token)
                that.getList()
                wx.getLocation({
                  success: function(res) {
                    wx.setStorageSync('lat', res.latitude)
                    wx.setStorageSync('lng', res.longitude)
                  }
                })
                that.getHomeData()
              }
            }
          })
        }
      })
    } else {
      that.setData({
        location: true
      })
      wx.getLocation({
        success: function(res) {
          wx.setStorageSync('lat', res.latitude)
          wx.setStorageSync('lng', res.longitude)
        }
      })
      that.getHomeData()
    }
  },

  goGoods() {
    const that = this
    setTimeout(() => {
      if (that.options.share_num == 'assemble') {
        wx.navigateTo({
          url: `/pages/details/assemble?activity_id=${that.options.activity_id}`
        })
      } else if (that.options.share_num == 'clearance') {
        wx.navigateTo({
          url: `/pages/details/clearance?activity_id=${that.options.activity_id}`
        })
      } else if (that.options.share_num == 'sample') {
        wx.navigateTo({
          url: `/pages/details/sample?activity_id=${that.options.activity_id}`
        })
      } else if (that.options.share_num == 'treasure') {
        wx.navigateTo({
          url: `/pages/details/treasure?activity_id=${that.options.activity_id}`
        })
      }
    }, 1000)
  },

  getList() {
    const that = this
    netWorkComm.netWork({
      url: 'order_modular/OrderProgression/getProgressionOrder',
      method: "POST",
      success(res) {
        console.log('未完成订单11')
        console.log(res)
        if (res.data.data) {
          let orderList1 = res.data.data
          orderList1.forEach((item, index) => {
            item.time = item.data.difference_time
            let timeOut = setInterval(() => {
              item.time--;
              that.setData({
                orderList: orderList1
              })
              if (item.time == 0) {
                clearInterval(timeOut)
              }
            }, 1000)
            tickers.push(timeOut)
          })
          that.setData({
            orderList: orderList1,
            order: true
          })
        }
      }
    })
  },

  group(array, subGroupLength) {
    let index = 0;
    let newArray = [];
    while (index < array.length) {
      newArray.push(array.slice(index, index += subGroupLength));
    }
    return newArray;
  },

  // 查看订单
  goOrder() {
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/order/order?current=${1}`,
      })
    }
    app.but()
  },

  // 砍价
  goHelp(e) {
    if (app.globalData.but) {
      let item = e.currentTarget.dataset.item
      this.setData({
        order: false
      })
      if (item.type == 'spike') {
        wx.navigateTo({
          url: `/pages/goPayment/help?order_sn=${item.data.order_sn}`,
        })
      } else if (item.type == "group_buy") {
        wx.navigateTo({
          url: `/pages/goAssemble/groubInfo?id=${item.data.user_order.id}&record_id=${item.data.user_order.record_id}`,
        })
      }
    }
    app.but()
  },

  // 请求数据
  getHomeData() {
    const that = this
    wx.showLoading({
      title: '正在加载...'
    })
    // 轮播图
    netWorkComm.netWork({
      url: 'index_modular/Ad/bannerV2',
      success(res) {
        if (res.data.data.length < 2) {
          that.setData({
            indicatorDots: false
          })
        }
        that.setData({
          banner: res.data.data
        })
      },
    })
    //导航栏列表
    netWorkComm.netWork({
      url: 'index_modular/Category/getCategory',
      success: function(res) {
        that.setData({
          'category.list': res.data.data,
        })
      }
    })
    //精品推荐
    netWorkComm.netWork({
      url: 'index_modular/IndexShow/getRecommendListV1',
      para: {
        intelligence: '折扣',
        lat: wx.getStorageSync('lat'),
        lng: wx.getStorageSync('lng'),
      },
      method: "POST",
      success: function(res) {
        that.setData({
          'recommend.list': res.data.data,
          token: wx.getStorageSync('token'),
          showList: true,
          show: true
        })
        // 请求完成关闭
        wx.hideLoading()
      }
    })
    wx.stopPullDownRefresh()
  },


  onShow() {
    const that = this
    if (wx.getStorageSync('login') == 'done') {
      that.setData({
        login: false
      })
    }
    wx.setStorageSync('login', 'done')
    if (wx.getStorageSync('token')) {
      that.getList()
    }
    that.setData({
      token: wx.getStorageSync('token'),
    })
    //砍价推荐
    netWorkComm.netWork({
      url: 'spike_modular/Home/spikeRecommend',
      method: 'POST',
      para: {
        is_show: '1'
      },
      success(res) {
        console.log(res.data.data.data)
        // let treasureNum = Math.ceil(res.data.data.data.length / 3)
        let numberArray = res.data.data.data;
        let groupedArray = that.group(numberArray, 3);
        console.log(groupedArray);
        if (groupedArray.length < 2) {
          that.setData({
            dots: false
          })
        }
        that.setData({
          groupedArray
        })
      }
    })
  },

  onHide() {
    app.globalData.but = true
    tickers.forEach(t => {
      if (t) {
        clearInterval(t)
      }
    })
    this.setData({
      order: false
    })
  },

  // 广告位
  goBanner(e) {
    const that = this
    console.log(e)
    let item = e.currentTarget.dataset.item
    let click_type = item.click_type
    if (app.globalData.but) {
      if (click_type == 1) {
        wx.navigateTo({
          url: `/pages/index/web?url=${item.ad_data}`,
        })
      } else if (click_type == 2) {
        if (item.activity_type == 1) {
          wx.navigateTo({
            url: `/pages/details/assemble?activity_id=${item.ad_data}`,
          })
        } else if (item.activity_type == 2) {
          wx.navigateTo({
            url: `/pages/details/sample?activity_id=${item.ad_data}`,
          })
        } else if (item.activity_type == 3) {
          wx.navigateTo({
            url: `/pages/details/treasure?activity_id=${item.ad_data}`,
          })
        } else if (item.activity_type == 4) {
          wx.navigateTo({
            url: `/pages/details/clearance?activity_id=${item.ad_data}`,
          })
        }
      } else if (click_type == 3) {
        wx.navigateTo({
          url: `/pages/goStore/index?store_id=${item.ad_data}`,
        })
      } else if (click_type == 5) {
        if (item.ad_data == "spike") {
          wx.switchTab({
            url: `/pages/index/treasure`,
          })
        } else if (item.ad_data == 'group_buy') {
          wx.navigateTo({
            url: `/pages/index/assemble`,
          })
        } else if (item.ad_data == 'sample') {
          wx.navigateTo({
            url: `/pages/index/sample`,
          })
        }
      }
    }
    app.but()
  },

  // 关闭
  goAll(e) {
    this.setData({
      order: false,
      unCollect: false,
      login: false
    })
    tickers.forEach(t => {
      if (t) {
        clearInterval(t)
      }
    })
  },

  // 无效点击
  goClick() {
    return
  },

  // 滚动穿透
  preventMove() {
    return
  },

  // 授权登录
  bindgetuserinfo(e) {
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
                wx.switchTab({
                  url: `/pages/index/treasure`,
                })
                that.setData({
                  login: false
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
        that.setData({
          login: false
        })
      }
      // wx.setStorageSync('login', 'done')
    }
    app.but()
  },

  // 机型
  getInfo() {
    const that = this
    wx.getSystemInfo({
      success: function(res) {
        console.log(res)
        let modelX = res.model.indexOf("iPhone X")
        let iosModel = res.model.indexOf('iPhone')
        let proportion = res.windowWidth / 2
        that.setData({
          proportion,
          modelX,
          iosModel,
          statusBarHeight: res.statusBarHeight * 2,
          pixe: res.windowWidth / 750
        })
      },
    })
  },

  // 导航栏
  switchCategory: function(e) {
    const that = this
    let offsetLeft = e.currentTarget.offsetLeft
    let current = e.currentTarget.dataset.index
    console.log(wx.getStorageSync('lat'))
    console.log(wx.getStorageSync('lng'))
    wx.pageScrollTo({
      scrollTop: 0,
    })
    that.setData({
      current,
      offsetLeft,
      firstIndex: false,
      page: 1,
    })
    that.goHome(current)
  },

  // 首页
  switchCategory1: function(e) {
    const that = this
    // let current = e.currentTarget.dataset.index
    wx.pageScrollTo({
      scrollTop: 0,
    })
    that.setData({
      // current,
      firstIndex: true,
      page: 1
    })
    // that.goHome(current)
  },

  //id获取值
  goHome(e) {
    const that = this
    let category_id = that.data.category.list[e].id
    netWorkComm.netWork({
      url: 'index_modular/Category/getActivityByCate',
      para: {
        category_id,
        lat: wx.getStorageSync('lat'),
        lng: wx.getStorageSync('lng'),
        page: 1
      },
      success(res) {
        console.log(res.data.data)
        that.setData({
          nice: res.data.data,
          length: res.data.count
        })
      }
    })
  },

  //更多
  toTrealist() {
    if (app.globalData.but) {
      wx.switchTab({
        url: '/pages/index/treasure'
      })
    }
    app.but()
  },

  // 首页去砍价
  goTreasures(e) {
    console.log(e)
    let activity_id = e.currentTarget.dataset.item.activity_id
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/details/treasure?activity_id=${activity_id}`
      })
    }
    app.but()
  },

  // 精品推荐去拼团
  toGroup: function(e) {
    let activity_id = this.data.recommend.list[e.currentTarget.dataset.index].activity_id
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/details/assemble?activity_id=${activity_id}`
      })
    }
    app.but()
  },

  // 精品推荐去砍价
  toTreasure(e) {
    let activity_id = this.data.recommend.list[e.currentTarget.dataset.index].activity_id
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/details/treasure?activity_id=${activity_id}`
      })
    }
    app.but()
  },

  // 分类去拼团
  goGroup: function(e) {
    let activity_id = e.currentTarget.dataset.id
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/details/assemble?activity_id=${activity_id}`
      })
    }
    app.but()
  },

  // 分类去砍价
  goTreasure(e) {
    console.log(e)
    let activity_id = e.currentTarget.dataset.id
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/details/treasure?activity_id=${activity_id}`
      })
    }
    app.but()
  },

  onReachBottom: function() {
    const that = this
    if (!that.data.firstIndex) {
      let category_id = that.data.category.list[that.data.current].id
      netWorkComm.netWork({
        url: 'index_modular/Category/getActivityByCate',
        para: {
          category_id,
          lat: wx.getStorageSync('lat'),
          lng: wx.getStorageSync('lng'),
          page: that.data.page + 1
        },
        success(res) {
          if (res.data.data) {
            let list = that.data.nice.concat(res.data.data)
            console.log(list)
            that.setData({
              page: that.data.page + 1,
              nice: list,
              length: res.data.count
            })
          }
        }
      })
    }
  },

  /*用户点击右上角分享*/
  onShareAppMessage: function(e) {
    return {
      title: '聚装修'
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.getHomeData()
    this.goHome(this.data.current)
  }
})