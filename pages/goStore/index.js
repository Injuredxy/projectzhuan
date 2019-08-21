const netWorkComm = require("../../utils/network.js")
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    type: 'group_buy',
    page_size: 5,
    p: 1,
    showBut: true,
    share: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const that = this
    wx.showLoading({
      title: '正在加载...',
    })
    that.getInfo()
    // 详情
    netWorkComm.netWork({
      url: 'index_modular/IndexShow/getStoreMoreInfo',
      para: {
        store_id: options.store_id
      },
      success(res) {
        console.log(res)
        wx.setNavigationBarTitle({
          title: `${res.data.data.brand}（${res.data.data.market}）`
        })
        let nice = res.data.data.store_cover.filter((item, index) => {
          return (index == 0)
        })
        let store_cover = res.data.data.store_cover
        console.log(store_cover)
        let store_image = []
        store_cover.forEach(item => {
          store_image.push(
            item.url
          )
        })
        console.log('店铺信息')
        console.log(res.data.data)
        that.setData({
          store: res.data.data,
          id: res.data.data.id,
          store_id: res.data.data.id,
          is_concern: res.data.data.is_concern,
          nice,
          store_image
        }, () => {
          that.canVas()
        })
      }
    })
    // 商品活动
    netWorkComm.netWork({
      url: 'index_modular/IndexShow/getCommonRecommendListV1',
      para: {
        store_id: options.store_id
      },
      success(res) {
        console.log('商品活动')
        console.log(res.data.data)
        that.setData({
          indexShow: res.data.data
        })
      }
    })
    // 评论列表
    netWorkComm.netWork({
      url: 'group_buy_modular/Comment/getUserCommentList',
      para: {
        more: '1',
        is_self: '0',
        store_id: options.store_id,
        page_size: '3'
      },
      success(res) {
        wx.hideLoading()
        that.setData({
          follow: res.data.data,
          show: true
        })
      }
    })
    // 往期活动
    netWorkComm.netWork({
      url: 'index_modular/IndexShow/getPastActivity',
      para: {
        store_id: options.store_id,
        activity_status: 2,
        activity_type: 1
      },
      success(res) {
        console.log('往期活动')
        console.log(res.data.data)
        wx.hideLoading()
        that.setData({
          past: res.data.data
        })
      }
    })
  },

  goShare() {
    this.setData({
      share: true
    })
  },

  // 地图
  goMap() {
    const that = this
    if (app.globalData.but) {
      wx.openLocation({
        latitude: parseFloat(that.data.store.lat),
        longitude: parseFloat(that.data.store.lng),
        name: that.data.store.brand,
        address: that.data.store.market
      })
    }
    app.but()
  },

  goAll(){
    this.setData({
      share: false
    })
  },

  // 买单
  toSweep() {
    if (app.globalData.but) {
      const that = this
      // wx.scanCode({
      //   onlyFromCamera: false,
      //   scanType: ['barCode', 'qrCode', 'datamatrix', 'pdf417'],
      //   success: (res) => { }
      // })
      wx.navigateTo({
        url: `/pages/goStore/sweep?store_id=${that.data.store_id}`,
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

  // 聚拼团
  goPast1() {
    const that = this
    netWorkComm.netWork({
      url: 'index_modular/IndexShow/getPastActivity',
      para: {
        store_id: that.data.store_id,
        activity_status: 2,
        activity_type: 1,
        p: 1
      },
      success(res) {
        console.log('聚拼团')
        console.log(res.data.data)
        wx.hideLoading()
        that.setData({
          p: 1,
          past: res.data.data,
          type: 'group_buy'
        })
      }
    })
  },

  // 免费领
  goPast2() {
    const that = this
    netWorkComm.netWork({
      url: 'index_modular/IndexShow/getPastActivity',
      para: {
        store_id: that.data.store_id,
        activity_status: 2,
        activity_type: 3,
        p: 1
      },
      success(res) {
        console.log('砍价')
        console.log(res.data.data)
        wx.hideLoading()
        that.setData({
          p: 1,
          past: res.data.data,
          type: 'spike'
        })
      }
    })
  },

  // 清样
  goPast3() {
    const that = this
    netWorkComm.netWork({
      url: 'index_modular/IndexShow/getPastActivity',
      para: {
        store_id: that.data.store_id,
        activity_status: 2,
        activity_type: 2,
        p: 1
      },
      success(res) {
        console.log('清样')
        console.log(res.data.data)
        wx.hideLoading()
        that.setData({
          p: 1,
          past: res.data.data,
          type: 'sample'
        })
      }
    })
  },

  // 加载更多
  goMore() {
    const that = this
    let type = that.data.type
    if (type == 'group_buy') {
      wx.showLoading({
        title: '正在加载...',
      })
      netWorkComm.netWork({
        url: 'index_modular/IndexShow/getPastActivity',
        para: {
          store_id: that.data.store_id,
          activity_status: 2,
          activity_type: 2,
          p: that.data.p + 1
        },
        success(res) {
          console.log('拼团')
          if (res.data.data) {
            let past = that.data.past.concat(res.data.data)
            that.setData({
              type: 'group_buy',
              past,
              p: that.data.p + 1
            })
          } else {
            that.setData({
              showBut: false
            })
          }
          wx.hideLoading()
        }
      })
    } else if (type == 'spike') {
      wx.showLoading({
        title: '正在加载...',
      })
      netWorkComm.netWork({
        url: 'index_modular/IndexShow/getPastActivity',
        para: {
          store_id: that.data.store_id,
          activity_status: 2,
          activity_type: 2,
          p: that.data.p + 1
        },
        success(res) {
          console.log('砍价')
          if (res.data.data) {
            let past = that.data.past.concat(res.data.data)
            that.setData({
              type: 'spike',
              past,
              p: that.data.p + 1
            })
          } else {
            that.setData({
              showBut: false
            })
          }
          wx.hideLoading()
        }
      })
    } else if (type == 'sample') {
      wx.showLoading({
        title: '正在加载...',
      })
      netWorkComm.netWork({
        url: 'index_modular/IndexShow/getPastActivity',
        para: {
          store_id: that.data.store_id,
          activity_status: 2,
          activity_type: 2,
          p: that.data.p + 1
        },
        success(res) {
          console.log('清样')
          if (res.data.data) {
            let past = that.data.past.concat(res.data.data)
            that.setData({
              type: 'sample',
              past,
              p: that.data.p + 1
            })
          } else {
            that.setData({
              showBut: false
            })
          }
          wx.hideLoading()
        }
      })
    }
  },

  // 打电话
  goIphon() {
    const that = this
    if (app.globalData.but) {
      wx.makePhoneCall({
        phoneNumber: that.data.store.mobile
      })
    }
    app.but()
  },

  // 导购电话
  goIphons(e) {
    let mobile = e.currentTarget.dataset.item.mobile
    if (app.globalData.but) {
      wx.makePhoneCall({
        phoneNumber: mobile
      })
    }
    app.but()
  },

  // 店铺图片
  goImage(e) {
    let itemUrl = e.currentTarget.dataset.itemurl
    let item = this.data.store_image
    if (app.globalData.but) {
      wx.previewImage({
        urls: item,
        current: itemUrl
      })
    }
    app.but()
  },

  // 全部评价
  goEvaluate(e) {
    let store_id = this.data.store_id
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/goStore/evaluate?store_id=${store_id}`,
      })
    }
    app.but()
  },

  // 收藏
  goCollection() {
    const that = this
    that.setData({
      is_concern: !that.data.is_concern
    })
    if (that.data.is_concern) {
      wx.showToast({
        title: '收藏成功',
        icon: 'none'
      })
      netWorkComm.netWork({
        url: 'user/Concern/addConcern',
        para: {
          store_id: that.data.store_id
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
        url: 'user/Concern/removeConcern',
        para: {
          store_id: that.data.store_id
        },
        success(res) {

        }
      })
    }
  },

  // 跳转商品详情
  goShop(e) {
    let activity_id = e.currentTarget.dataset.item.data.activity_id
    let type = e.currentTarget.dataset.item.type
    if (app.globalData.but) {
      if (type == 'group_buy') {
        wx.navigateTo({
          url: `/pages/details/assemble?activity_id=${activity_id}`,
        })
      } else if (type == 'spike') {
        wx.navigateTo({
          url: `/pages/details/treasure?activity_id=${activity_id}`,
        })
      } else if (type == 'temai') {
        wx.navigateTo({
          url: `/pages/details/sample?activity_id=${activity_id}`,
        })
      }
    }
    app.but()
  },


  getInfo() {
    const that = this
    wx.getSystemInfo({
      success: function(res) {
        let pixe = res.windowWidth / 375
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
    let pixe = that.data.pixe
    let cover_image = that.data.nice[0].url.replace('http://file.zhuangxiumall.cn', 'https://api.zhuangxiumall.cn')
    let cover_text = `地址：${that.data.store.city.name}${that.data.store.area.name}${that.data.store.address}`
    wx.getImageInfo({
      src: cover_image,
      success(res) {
        let cx = wx.createCanvasContext('canvas')
        cx.save();
        cx.drawImage(res.path, 0, 0, 750 * pixe / 2, 600 * pixe / 2)
        cx.setFontSize(29 * pixe / 2)
        cx.setFillStyle('#fff')
        cx.fillText(`${that.data.store.brand}（${that.data.store.market}）`, 21 * pixe / 2, 500 * pixe / 2)
        cx.setFontSize(29 * pixe / 2)
        cx.setFillStyle('#fff')
        cx.fillText(`电话：${that.data.store.mobile}`, 21 * pixe / 2, 543 * pixe / 2)
        cx.setFontSize(29 * pixe / 2)
        cx.setFillStyle('#fff')
        cx.fillText(cover_text, 21 * pixe / 2, 586 * pixe / 2)
        cx.draw(true, setTimeout(function() {
          wx.canvasToTempFilePath({
            canvasId: 'canvas',
            success: function(res) {
              that.setData({
                shareImage: res.tempFilePath
              })
            }
          })
        }, 500))
      }
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
    return {
      path: `/pages/goStore/index?store_id=${that.data.store_id}`,
      imageUrl: that.data.shareImage,
      title: `【${that.data.store.brand}】`
    }
  }
})