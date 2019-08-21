const app = getApp()
const netWorkComm = require("../../utils/network.js")
let SocketTask
const Config = require('../../utils/config.js')


Page({

  /**
   * 页面的初始数据
   */
  data: {
    order_type: ['全部', '待完成', '待兑换', '待评价', '退款'],
    order: [],
    all_order: [],
    // 作为中间件
    mid_order_list: [],
    code: false,
    show: true,
    share: false,
    sliderOffset: 9,
    all_arr: [],
    codeLayer: false,
    write: false,
    codeTime: '',
    codeList: ''
  },

  // 无效点击
  goClick() {
    return
  },

  goShare(e) {
    let shareItem = e.currentTarget.dataset.order_id
    this.setData({
      share: true,
      shareItem
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

  // 关闭所有
  goAll() {
    this.setData({
      code: false,
      share: false,
      codeLayer: false,
      write: false,
      code_image: ''
    })
  },

  // 滚动穿透
  preventMove() {
    return
  },

  // 找助力
  goHelp(e) {
    console.log('转发')
  },

  // 找拼友
  goFriend(e) {
    console.log('转发')
  },

  // 商家信息
  goStore(e) {
    let store_id = e.currentTarget.dataset.id
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/goStore/index?store_id=${store_id}`
      })
    }
    app.but()
  },

  // 去评价
  goComment(e) {
    let id = e.currentTarget.dataset.order_id.order.id
    let type = e.currentTarget.dataset.order_id.type
    let img_url = e.currentTarget.dataset.order_id.order.goods.img_url
    let name = e.currentTarget.dataset.order_id.order.goods.product_name
    let price = e.currentTarget.dataset.order_id.order.price
    let activity_id = e.currentTarget.dataset.order_id.order.group_buy_id
    console.log(e.currentTarget.dataset.order_id)
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/goAssemble/comment?order_id=${id}&price=${price}&name=${name}&img_url=${img_url}&type=${type}&activity_id=${activity_id}`
      })
    }
    app.but()
  },

  // 去支付
  goPay(e) {
    console.log(e)
    const that = this
    let order_sn = e.currentTarget.dataset.order_id.order.order_sn
    let name = e.currentTarget.dataset.order_id.order.goods.product_name
    let price = e.currentTarget.dataset.order_id.order.price - 0
    let activity_id = e.currentTarget.dataset.order_id.order.goods.id
    let id = e.currentTarget.dataset.order_id.order.id
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/goPayment/treasurePay?activity_id=${activity_id}&order_sn=${order_sn}&new_price=${price}&product_name=${name}&buy_type=${1}&id=${id}`,
      })
    }
    app.but()
  },

  // 查看退款
  goFund(e) {
    let type = e.currentTarget.dataset.item.type
    let order_status = e.currentTarget.dataset.item.order.order_status
    let id = e.currentTarget.dataset.item.order.id
    let order_sn = e.currentTarget.dataset.item.order.order_sn
    let record_id = e.currentTarget.dataset.item.order.record_id
    console.log(e.currentTarget.dataset.item)
    console.log(order_status)
    if (app.globalData.but) {
      if (order_status == 8) {
        if (type == 'group_buy_direct') {
          wx.navigateTo({
            url: `/pages/goAssemble/refund?id=${id}&type=${'direct'}`
          })
        } else if (type == 'group_buy') {
          wx.navigateTo({
            url: `/pages/goAssemble/refund?id=${id}&record_id=${record_id}&type=${'group'}`
          })
        } else if (type == 'spike') {
          wx.navigateTo({
            url: `/pages/goAssemble/refund?order_sn=${order_sn}&type=${'spike'}`
          })
        } else if (type == 'sample') {
          wx.navigateTo({
            url: `/pages/goAssemble/refund?order_sn=${order_sn}&type=${'sample'}`
          })
        }
      } else {
        if (type == 'group_buy_direct') {
          wx.navigateTo({
            url: `/pages/goAssemble/direct?id=${id}`
          })
        } else if (type == 'group_buy') {
          if (order_status == 1) {
            wx.navigateTo({
              url: `/pages/goAssemble/groubInfo?id=${id}&record_id=${record_id}`
            })
          } else {
            wx.navigateTo({
              url: `/pages/goAssemble/details?id=${id}&record_id=${record_id}`
            })
          }
        } else if (type == 'spike') {
          wx.navigateTo({
            url: `/pages/goPayment/help?order_sn=${order_sn}`
          })
        } else if (type == 'scan') {
          wx.navigateTo({
            url: `/pages/order/details?order_sn=${order_sn}`,
          })
        } else if (type == 'sample') {
          wx.navigateTo({
            url: `/pages/goSample/details?order_sn=${order_sn}`,
          })
        }
      }
    }
    app.but()
  },

  // 查看券码
  // goVolume(e) {
  //   const that = this
  //   console.log(e.currentTarget.dataset.order_id)
  //   let id = e.currentTarget.dataset.order_id.order.id
  //   let exchange_code = e.currentTarget.dataset.order_id.order.exchange_code
  //   netWorkComm.netWork({
  //     url: 'communal/Qrcode/createQrcode',
  //     method: "POST",
  //     para: {
  //       info: exchange_code
  //     },
  //     success(res) {
  //       console.log(res)
  //       let code_image = wx.arrayBufferToBase64(wx.base64ToArrayBuffer(res.data.data))
  //       let code_image1 = "data:image/png;base64," + code_image
  //       that.setData({
  //         code_image: code_image1,
  //         id,
  //         code: true
  //       }, () => {
  //         if (that.data.code) {
  //           that.webSocket()
  //           wx.onUserCaptureScreen(function (res) {
  //             that.setData({
  //               codeLayer: true
  //             })
  //           })
  //         }
  //       })
  //     }
  //   })
  // },

  goLayer() {
    this.setData({
      codeLayer: false
    })
  },

  webSocket(e) {
    const that = this
    if (app.globalData.but) {
      let id = e.currentTarget.dataset.order_id.order.id
      netWorkComm.netWork({
        url: 'payment_modular/CommonPay/getOrderExchangeCode',
        para: {
          order_id: id,
        },
        success(res) {
          console.log(res)
          if (res.data.status == 'success') {
            let code_image = wx.arrayBufferToBase64(wx.base64ToArrayBuffer(res.data.data.qrcode))
            let code_image1 = "data:image/png;base64," + code_image
            that.setData({
              code_image: code_image1
            })
            wx.onUserCaptureScreen(function(res) {
              that.setData({
                codeLayer: true
              })
            })
          }
        }
      })
    }
    app.but()
  },

  goWrite(e) {
    this.setData({
      write: true,
      codeList: e.currentTarget.dataset.order_id
    })
  },

  goCode(e) {
    const that = this
    if (app.globalData.but) {
      let id = that.data.codeList.order.id
      let exchange_code = that.data.codeList.order.exchange_code
      netWorkComm.netWork({
        url: 'payment_modular/CommonPay/writeExchangeCode',
        method: "POST",
        para: {
          order_id: id,
          exchange_code
        },
        success(res) {
          console.log('确认兑换', res)
          if (res.data.status == 'success') {
            wx.showToast({
              title: '兑换成功',
              icon: 'none'
            })
            that.setData({
              write: false,
              codeList: ''
            })
            that.orderList('WAIT_EXCHANGE')
          }
        }
      })
    }
    app.but()
  },

  // clickTab_excha(e) {
  //   this.setData({
  //     current_excha: e.target.dataset.index
  //   })
  // },
  orderList(order_type, btn) {
    const that = this;
    if (wx.getStorageSync('token')) {
      netWorkComm.netWork({
        url: 'user/User/orderListV1',
        method: "POST",
        para: {
          order_status_type: order_type,
          p: "1",
          page_size: "100"
        },
        success(res) {
          console.log(res)
          if (res.data.status === "success") {
            wx.stopPullDownRefresh()
            if (res.data.data) {
              let new_arr = JSON.parse(JSON.stringify(res.data.data));
              new_arr.forEach(e => {
                if (e.order_lists.length > 2) {
                  e.order_lists = e.order_lists.slice(0, 2)
                }
              })
              that.setData({
                // 显示数据
                order: new_arr,
                // 所有数据
                all_order: res.data.data
              })
            } else {
              that.setData({
                // 显示数据
                order: [],
              })
            }
          }
        }
      })
    }
  },

  chc_more(e) {
    this.setData({
      mid_order_list: this.data.all_order[e.target.dataset.index].order_lists,
    })
    let new_arr = []
    this.data.order.forEach((event, index) => {
      new_arr.push(event);
    })
    new_arr[e.target.dataset.index].order_lists = this.data.mid_order_list;
    this.setData({
      order: new_arr
    })
  },
  chc_less(e) {
    this.setData({
      mid_order_list: this.data.all_order[e.target.dataset.index].order_lists.slice(0, 2)
    })
    let new_arr = []
    this.data.order.forEach((event, index) => {
      new_arr.push(event);
    })
    new_arr[e.target.dataset.index].order_lists = this.data.mid_order_list;
    this.setData({
      order: new_arr
    })
  },
  getOrder_by_2() {
    if (this.data.current == 0) {
      this.orderList('ALL')
    } else if (this.data.current == 1) {
      this.orderList('WAIT_FINISH');
    } else if (this.data.current == 2) {
      this.orderList('WAIT_EXCHANGE');
    } else if (this.data.current == 3) {
      this.orderList('WAIT_CCOMMENT')
    } else if (this.data.current == 4) {
      this.orderList('REFUND')
    }
  },

  clickTab(e) {
    console.log(e)
    const that = this
    that.setData({
      current: e.target.dataset.index,
      sliderOffset: e.currentTarget.offsetLeft,
    })
    console.log(e.currentTarget.offsetLeft)
    let index = that.data.current
    console.log(index)
    if (index == 0) {
      that.orderList('ALL')
    } else if (index == 1) {
      that.orderList('WAIT_FINISH');
    } else if (index == 2) {
      that.orderList('WAIT_EXCHANGE');
    } else if (index == 3) {
      that.orderList('WAIT_CCOMMENT')
    } else if (index == 4) {
      that.orderList('REFUND')
    }
  },

  // 滑动
  swiperChange(e) {
    const that = this
    that.setData({
      current: e.detail.current
    })
    let index = that.data.current
    console.log(index)
    if (index == 0) {
      that.orderList('ALL')
      that.setData({
        sliderOffset: 9
      })
    } else if (index == 1) {
      that.orderList('WAIT_FINISH');
      that.setData({
        sliderOffset: 71
      })
    } else if (index == 2) {
      that.orderList('WAIT_EXCHANGE');
      that.setData({
        sliderOffset: 149
      })
    } else if (index == 3) {
      that.orderList('WAIT_CCOMMENT')
      that.setData({
        sliderOffset: 227
      })
    } else if (index == 4) {
      that.orderList('REFUND')
      that.setData({
        sliderOffset: 305
      })
    }
  },

  onLoad: function(options) {
    const that = this
    that.setData({
      current: options.current
    })
    that.getInfo()
    that.getOrder_by_2()
    wx.getSystemInfo({
      success: function(res) {
        console.log(res)
        that.setData({
          pixe: res.windowWidth / 375
        })
      },
    })
  },

  onShareAppMessage(e) {
    const that = this
    that.setData({
      share: false
    })
    if (that.data.shareItem.type == 'spike') {
      let order_sn = that.data.shareItem.order.order_sn
      let shareImage = that.data.shareItem.order.goods.img_url
      console.log(shareImage)
      return {
        title: '只花您一秒，让我把它带回家！',
        path: `/pages/goPayment/help?order_sn=${order_sn}&invitation_type=${wx.getStorageSync('invitation_type')}&parent_id=${wx.getStorageSync('parent_id')}&register_scene=${wx.getStorageSync('register_scene')}&share_number=${wx.getStorageSync('share_number')}&from_order_sn=${wx.getStorageSync('from_order_sn')}`,
        imageUrl: shareImage
      }
    } else if (that.data.shareItem.type == 'group_buy') {
      let record_id = that.data.shareItem.order.record_id
      let id = that.data.shareItem.order.id
      let shareImage = that.data.shareItem.order.goods.img_url
      return {
        title: '再不拼，便宜都让别人占了！快来和我一起拼团吧！',
        path: `/pages/goAssemble/groubInfo?record_id=${record_id}&is_check=${'0'}&id=${id}&invitation_type=${wx.getStorageSync('invitation_type')}&parent_id=${wx.getStorageSync('parent_id')}&register_scene=${wx.getStorageSync('register_scene')}&share_number=${wx.getStorageSync('share_number')}&from_order_sn=${wx.getStorageSync('from_order_sn')}`,
        imageUrl: shareImage
      }
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.setData({
      show: true
    })
  },

  onShow: function() {
    this.getOrder_by_2()
    wx.hideShareMenu()
    this.setData({
      token: wx.getStorageSync('token')
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    app.globalData.but = true
    if (this.data.code) {
      that.setData({
        code: false
      })
      SocketTask.close()
    }
    clearInterval(this.data.codeTime)
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
    if (wx.getStorageSync('token')) {
      this.getOrder_by_2();
    } else {
      wx.stopPullDownRefresh()
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  }
})