const netWorkComm = require("../../utils/network.js")
const app = getApp()
let SocketTask
let setTime = ''
const Config = require('../../utils/config.js')


Page({

  /**
   * 页面的初始数据
   */
  data: {
    cancel: false,
    show: false,
    share: false,
    vest: false,
    showView: false,
    timeOut: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const that = this
    that.setData({
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
    }
    if (options.share_number) {
      wx.setStorageSync('invitation_type', options.invitation_type)
      wx.setStorageSync('parent_id', options.parent_id)
      wx.setStorageSync('register_scene', options.register_scene)
      wx.setStorageSync('share_number', options.share_number)
      wx.setStorageSync('from_order_sn', options.from_order_sn)
    }
    console.log('拼团分享码')
    console.log(wx.getStorageSync('share_number'))
  },

  goShare() {
    this.setData({
      share: true
    })
  },

  // 查看退款详情
  goRefund() {
    let record_id = this.data.options.record_id
    let id = this.data.options.id
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/goAssemble/refund?record_id=${record_id}&type=${'group'}`
      })
    }
    app.but()
  },

  getHomeData() {
    const that = this
    that.setData({
      token: wx.getStorageSync('token')
    })
    wx.showLoading({
      title: '正在加载...',
    })
    netWorkComm.netWork({
      url: 'group_buy_modular/ActivityGroupBuyOrder/getGroupBuyRecord',
      para: {
        group_buy_record_id: that.data.options.record_id,
        is_check: that.data.options.is_check
      },
      success(res) {
        console.log('拼团详情')
        console.log(res)
        if (res.data.code == '61002') {
          wx.showToast({
            title: '拼团已关闭',
            icon: 'none',
            duration: 3000,
            success(res) {
              setTime = setTimeout(() => {
                wx.switchTab({
                  url: '/pages/index/index',
                })
              }, 2000)
            }
          })
        } else {
          that.setData({
            fabulous: res.data.data,
            time: res.data.data.difference_time,
            in_order: res.data.data.in_order,
            status: res.data.data.status,
            share_order_sn: res.data.data.share_order_sn,
            show: true
          }, () => {
            that.canVas()
            that.countDown()
          })
          wx.hideLoading()
        }
      }
    })
    wx.stopPullDownRefresh()
  },

  // 退款
  goCancel() {
    this.setData({
      cancel: true,
      showView: true
    })
  },

  //获取文本内容
  textInput(e) {
    this.setData({
      value: e.detail.value
    })
  },

  // 退款原因
  goCancelText() {
    const that = this
    let id = that.data.fabulous.activity_group_buy_order.id
    let value = that.data.value
    let record_id = that.data.options.record_id
    if (app.globalData.but) {
      if (value) {
        netWorkComm.netWork({
          url: 'payment_modular/CommonPay/refundOrder',
          method: 'POST',
          para: {
            order_id: id,
            refund_reason: value
          },
          success(res) {
            console.log('拼团退款')
            console.log(res)
            if (res.data.status == 'success') {
              that.setData({
                cancel: false
              })
              wx.redirectTo({
                url: `/pages/goAssemble/refund?record_id=${record_id}&is_check=${'1'}&type=${'group'}`,
              })
            }
          }
        })
      } else {
        wx.showToast({
          title: '请填写退款原因',
          icon: 'none'
        })
      }
    }
    app.but()
  },

  // 倒计时
  countDown(time) {
    const that = this
    let countDownNum = that.data.time
    that.setData({
      countDownNum
    })
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
  },

  // 无效点击
  goClick() {
    return
  },

  // 关闭所有
  goAll() {
    this.setData({
      cancel: false,
      share: false,
      vest: false
    })
  },

  // 滚动穿透
  preventMove() {
    return
  },

  // 买
  goShop() {
    let activity_id = this.data.fabulous.activity_group_buy.activity_id
    console.log(activity_id)
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/details/assemble?activity_id=${activity_id}`
      })
    }
    app.but()
  },

  // 重新发起拼团
  goNew() {
    const that = this
    console.log('重新发起拼团')
    console.log(wx.getStorageSync('from_order_sn'))
    if (app.globalData.but) {
      netWorkComm.netWork({
        url: 'group_buy_modular/ActivityGroupBuyOrder/addGroupBuyOrder',
        method: "POST",
        para: {
          group_buy_id: that.data.fabulous.activity_group_buy.activity_id,
          invitation_type: wx.getStorageSync('invitation_type'),
          parent_id: wx.getStorageSync('parent_id'),
          register_scene: wx.getStorageSync('register_scene'),
          share_number: wx.getStorageSync('share_number'),
          from_order_sn: wx.getStorageSync('from_order_sn'),
        },
        success(res) {
          console.log('重新发起拼团')
          console.log(res)
          if (res.data.code == '61004') {
            that.setData({
              vest: true
            })
          } else {
            let order_sn = res.data.data.order_sn
            let record_id = res.data.data.record_id
            let id = res.data.data.id
            let price = that.data.fabulous.activity_group_buy.group_buy_price > 100 ? 100 : that.data.fabulous.activity_group_buy.group_buy_price
            let name = that.data.fabulous.activity_group_buy.goods.product_name
            wx.navigateTo({
              url: `/pages/goPayment/treasurePay?&order_sn=${order_sn}&new_price=${price}&product_name=${name}&buy_type=${3}&record_id=${record_id}&id=${id}`,
            })
          }
        }
      })
    }
    app.but()
  },

  // 我要参团
  goJoin() {
    const that = this
    console.log('我要参团')
    console.log(wx.getStorageSync('from_order_sn'))
    if (app.globalData.but) {
      netWorkComm.netWork({
        url: 'group_buy_modular/ActivityGroupBuyOrder/joinGroupBuy',
        para: {
          group_buy_record_id: that.data.options.record_id,
          invitation_type: wx.getStorageSync('invitation_type'),
          parent_id: wx.getStorageSync('parent_id'),
          register_scene: wx.getStorageSync('register_scene'),
          share_number: wx.getStorageSync('share_number'),
          from_order_sn: wx.getStorageSync('from_order_sn'),
        },
        success(res) {
          console.log('我要参团')
          console.log(res)
          if (res.data.code == '61005') {
            that.setData({
              vest: true
            })
          } else {
            let order_sn = res.data.data.order_sn
            let activity_id = res.data.data.group_buy_id
            let id = res.data.data.id
            let record_id = res.data.data.record_id
            let name = res.data.data.product_name
            let price = res.data.data.price > 100 ? 100 : res.data.data.price
            let status = res.data.status
            if (status == 'fail') {
              wx.showToast({
                title: res.data.msg,
                icon: 'none'
              })
            }
            wx.navigateTo({
              url: `/pages/goPayment/treasurePay?order_sn=${order_sn}&buy_type=${6}&record_id=${record_id}&id=${id}&activity_id=${activity_id}&product_name=${name}&new_price=${price}`,
            })
          }
        }
      })
    }
    app.but()
  },

  // 去买
  goBuy(e) {
    console.log(e)
    let activity_id = e.currentTarget.dataset.item.data.activity_id
    let type = e.currentTarget.dataset.item.type
    if (app.globalData.but) {
      if (type == 'spike') {
        wx.navigateTo({
          url: `/pages/details/treasure?activity_id=${activity_id}`
        })
      } else if (type == 'group_buy') {
        wx.navigateTo({
          url: `/pages/details/assemble?activity_id=${activity_id}`
        })
      }
    }
    app.but()
  },

  // 买
  goShop() {
    let activity_id = this.data.fabulous.activity_group_buy.activity_id
    console.log(activity_id)
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/details/assemble?activity_id=${activity_id}`
      })
    }
    app.but()
  },

  // 查看订单
  goDetails() {
    wx.navigateTo({
      url: `/pages/goAssemble/details?record_id=${this.data.fabulous.activity_group_buy_order.record_id}`,
    })
  },

  // 授权登录
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
                console.log('拼团登录')
                console.log(res)
                let openId = res.data.data.three_user.openId
                let unionId = res.data.data.three_user.unionId
                let head_pic = res.data.data.three_user.avatarUrl
                let nickName = res.data.data.three_user.nickName
                let activity_id = that.data.fabulous.activity_group_buy.activity_id
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
                console.log('拼团登录')
                console.log(res)
                let openId = res.data.data.three_user.openId
                let unionId = res.data.data.three_user.unionId
                let head_pic = res.data.data.three_user.avatarUrl
                let nickName = res.data.data.three_user.nickName
                let activity_id = that.data.fabulous.activity_group_buy.activity_id
                let name = that.data.fabulous.activity_group_buy.goods.product_name
                let price = that.data.fabulous.activity_group_buy.group_buy_price > 100 ? 100 : that.data.fabulous.activity_group_buy.group_buy_price
                let record_id = that.data.options.record_id
                wx.navigateTo({
                  url: `/pages/goPayment/treasurePay?openId=${openId}&unionId=${unionId}&head_pic=${head_pic}&nickName=${nickName}&record_id=${record_id}&product_name=${name}&new_price=${price}&buy_type=${6}`,
                })
                console.log('给我过来')
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

  getInfo() {
    const that = this
    wx.getSystemInfo({
      success: function(res) {
        console.log(res)
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
    let detail = that.data.fabulous
    let pixe = that.data.pixe
    let price = detail.activity_group_buy.group_buy_price - 0
    let old_price = detail.activity_group_buy.origin_price - 0
    let cover_image = detail.activity_group_buy.goods.img_url.replace('http://file.zhuangxiumall.cn', 'https://api.zhuangxiumall.cn')
    let head_image = that.data.fabulous.users[0] ? that.data.fabulous.users[0].replace('http://thirdwx.qlogo.cn', 'https://wx.qlogo.cn') : '/images/ic_my_head_def@3x.png'
    console.log('头像')
    console.log(head_image)
    wx.getImageInfo({
      src: cover_image,
      success(res) {
        let cover_images = res.path
        wx.getImageInfo({
          src: head_image,
          success(res) {
            let head_images = res.path
            let cover_text = `本活动商品由${detail.store.brand}(深圳)提供`
            let cx = wx.createCanvasContext('canvas')
            cx.save();
            cx.drawImage(cover_images, 0, 0, 750 * pixe / 2, 600 * pixe / 2)
            cx.drawImage('/images/img_smallroutine_rectangle@2x.png', 0, 411 * pixe / 2, 750 * pixe / 2, 189 * pixe / 2)
            cx.drawImage('/images/img_smallroutine1@2x.png', 500 * pixe / 2, 0, 250 * pixe / 2, 93 * pixe / 2)
            cx.drawImage('/images/ic_smallroutine_circle@2x.png', 646 * pixe / 2, 461 * pixe / 2, 80 * pixe / 2, 80 * pixe / 2)
            cx.beginPath() //开始创建一个路径
            cx.arc(586 * pixe / 2, 501 * pixe / 2, 40 * pixe / 2, 0, 2 * Math.PI, false)
            //画一个圆形裁剪区域
            // cx.stroke();
            cx.clip() //裁剪
            cx.drawImage(head_images, 546 * pixe / 2, 461 * pixe / 2, 80 * pixe / 2, 80 * pixe / 2)
            // cx.stroke();
            cx.restore() //恢复之前保存的绘图上下文
            cx.setFontSize(56 * pixe / 2)
            cx.setFillStyle('#F8524E')
            cx.fillText('￥', 36 * pixe / 2, 534 * pixe / 2)
            cx.setFontSize(86 * pixe / 2)
            cx.setFillStyle('#F8524E')
            cx.fillText(price, 79 * pixe / 2, 534 * pixe / 2)
            cx.setFontSize(45 * pixe / 2)
            cx.setFillStyle('#fff')
            cx.setStrokeStyle('white')
            if (price < 1000) {
              cx.fillText(`￥${old_price}`, 236 * pixe / 2, 529 * pixe / 2)
              cx.moveTo(236 * pixe / 2, 510 * pixe / 2)
              if (old_price < 100) {
                cx.lineTo(336 * pixe / 2, 514 * pixe / 2)
              } else if (old_price < 1000) {
                cx.lineTo(366 * pixe / 2, 514 * pixe / 2)
              } else if (old_price < 10000) {
                cx.lineTo(396 * pixe / 2, 514 * pixe / 2)
              } else if (old_price < 100000) {
                cx.lineTo(426 * pixe / 2, 514 * pixe / 2)
              }
            } else if (price < 10000) {
              cx.fillText(`￥${old_price}`, 280 * pixe / 2, 529 * pixe / 2)
              cx.moveTo(280 * pixe / 2, 510 * pixe / 2)
              if (old_price < 100) {
                cx.lineTo(380 * pixe / 2, 514 * pixe / 2)
              } else if (old_price < 1000) {
                cx.lineTo(410 * pixe / 2, 514 * pixe / 2)
              } else if (old_price < 10000) {
                cx.lineTo(440 * pixe / 2, 514 * pixe / 2)
              } else if (old_price < 100000) {
                cx.lineTo(470 * pixe / 2, 514 * pixe / 2)
              }
            } else if (price < 100000) {
              cx.fillText(`￥${old_price}`, 330 * pixe / 2, 529 * pixe / 2)
              cx.moveTo(330 * pixe / 2, 510 * pixe / 2)
              if (old_price < 100) {
                cx.lineTo(430 * pixe / 2, 514 * pixe / 2)
              } else if (old_price < 1000) {
                cx.lineTo(460 * pixe / 2, 514 * pixe / 2)
              } else if (old_price < 10000) {
                cx.lineTo(490 * pixe / 2, 514 * pixe / 2)
              } else if (old_price < 100000) {
                cx.lineTo(520 * pixe / 2, 514 * pixe / 2)
              }
            }
            cx.stroke()
            cx.setFontSize(29 * pixe / 2)
            cx.setFillStyle('#fff')
            cx.fillText(cover_text, 36 * pixe / 2, 580 * pixe / 2)
            cx.draw(true, setTimeout(() => {
              wx.canvasToTempFilePath({
                canvasId: 'canvas',
                success: function(res) {
                  console.log(res.tempFilePath)
                  that.setData({
                    shareImage: res.tempFilePath
                  })
                }
              })
            }, 500))
          }
        })
      }
    })
  },

  // 分享
  onShareAppMessage(res) {
    const that = this
    that.setData({
      share: false
    })
    let record_id = that.data.options.record_id
    let id = that.data.fabulous.activity_group_buy_order.id ? that.data.fabulous.activity_group_buy_order.id : ''
    return {
      title: '再不拼，便宜就都让别人占了！快来和我一起拼团吧！',
      path: `/pages/goAssemble/groubInfo?record_id=${record_id}&is_check=${'0'}&id=${id}&invitation_type=${wx.getStorageSync('invitation_type')}&parent_id=${wx.getStorageSync('parent_id')}&register_scene=${wx.getStorageSync('register_scene')}&share_number=${wx.getStorageSync('share_number')}&from_order_sn=${that.data.share_order_sn}`,
      imageUrl: that.data.shareImage
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
      token: wx.getStorageSync('token')
    })
    if (wx.getStorageSync('token')) {
      that.getHomeData()
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    app.globalData.but = true
    clearInterval(this.data.timeOut)
    clearInterval(setTime)
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
    this.selectComponent("#group").getMoreGroup()
  }
})