const netWorkComm = require("../../utils/network.js")
const app = getApp()
let SocketTask
const Config = require('../../utils/config.js')


Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    phone: false,
    play: false,
    refund: false,
    codes: false,
    showView: false,
    exchangeStatus: false,
    share: false,
    page_size: 5,
    spot: false,
    scrollTop: 0,
    p: 1,
    timeOut: '',
    codeLayer: false,
    vest: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const that = this
    that.setData({
      order_sn: options.order_sn,
      options
    })
    that.getInfo()
    if (!wx.getStorageSync('token')) {
      wx.login({
        success(res) {
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
              } else if (res.data.data.user) {
                wx.setStorageSync('token', res.data.data.user.token)
              }
            }
          })
        }
      })
    }
    console.log('砍价分享码')
    console.log(options)
    if (options.share_number) {
      wx.setStorageSync('invitation_type', options.invitation_type)
      wx.setStorageSync('parent_id', options.parent_id)
      wx.setStorageSync('register_scene', options.register_scene)
      wx.setStorageSync('share_number', options.share_number)
      wx.setStorageSync('from_order_sn', options.from_order_sn)
    }
  },

  goShare() {
    this.setData({
      share: true,
      codes: false
    })
  },

  // 去免费领
  toTreasure: function(e) {
    let activity_id = this.data.treasure.list[e.currentTarget.dataset.index].activity_id
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/details/treasure?activity_id=${activity_id}`
      })
    }
    app.but()
  },

  toCore() {
    const that = this
    netWorkComm.netWork({
      url: 'spike_modular/Task/getList',
      method: 'POST',
      success(res) {
        console.log('任务列表')
        console.log(res.data.data)
        let code14 = res.data.data.list.filter((item, index) => {
          return (item.id == 14)
        })
        console.log('code14')
        let spikeStatus = code14[0].status
        console.log(spikeStatus)
      }
    })
  },

  // 本人数据
  getMyInfo() {
    const that = this
    that.setData({
      token: wx.getStorageSync('token')
    })
    wx.showLoading({
      title: '正在加载...',
    })
    //免费领列表
    netWorkComm.netWork({
      url: 'spike_modular/Home/getSpikeListV1',
      method: 'POST',
      para: {
        lat: wx.getStorageSync('lat'),
        lng: wx.getStorageSync('lng'),
        p: 1
      },
      success: function(res) {
        console.log(res.data.data)
        that.setData({
          p: 1,
          'treasure.list': res.data.data,
        })
      }
    })
    netWorkComm.netWork({
      url: 'index_modular/Share/spikeOrderInfo',
      para: {
        order_sn: that.data.order_sn
      },
      success(res) {
        console.log('砍价显示页面')
        console.log(res)
        console.log(wx.getStorageSync('token'))
        let order_status = res.data.data.order_info.order_status
        let my_order = res.data.data.order_info.my_order
        if (my_order) {
          if (order_status == '1') {
            wx.setNavigationBarTitle({
              title: '新人免费领'
            })
          } else {
            wx.setNavigationBarTitle({
              title: '订单详情'
            })
          }
        } else {
          wx.setNavigationBarTitle({
            title: '新人免费领'
          })
        }
        that.setData({
          help: res.data.data,
          in_like: res.data.data.in_like,
          likes: res.data.data.order_info.has_spike_likes,
          order_status: res.data.data.order_info.order_status,
          time: res.data.data.order_info.difference_time,
          my_order
        }, () => {
          that.canVas()
          that.countDown()
          wx.stopPullDownRefresh()
        })
      }
    })
    if (wx.getStorageSync('token')) {
      netWorkComm.netWork({
        url: 'spike_modular/SpikeOrder/orderInfo',
        para: {
          order_sn: that.data.options.order_sn,
          is_check: '0'
        },
        success(res) {
          console.log('本人数据')
          console.log(res)
          let bar = res.data.data.order_info.has_spike_likes / res.data.data.order_info.need_spike_likes * 100
          let exchange_code = res.data.data.order_info.exchange_code
          console.log(exchange_code)
          let exchange_code1 = exchange_code.replace(/(.{4})/g, "$1 ")
          that.setData({
            fabulous: res.data.data,
            order_sn: res.data.data.order_info.order_sn,
            order_status: res.data.data.order_info.order_status,
            exchange: res.data.data.order_info.exchange_code_status,
            time: res.data.data.order_info.difference_time,
            likes: res.data.data.order_info.has_spike_likes,
            exchange_time: res.data.data.order_info.exchange_code_end_time_difference,
            bar,
            exchange_code1
          }, () => {
            wx.setStorageSync('from_order_sn', that.data.order_sn ? that.data.order_sn : wx.getStorageSync('from_order_sn'))
            that.countDown()
          })
        }
      })
    }
    // 砍价记录
    netWorkComm.netWork({
      url: 'spike_modular/SpikeOrder/getOrderLikes',
      method: 'POST',
      para: {
        order_sn: that.data.options.order_sn
      },
      success(res) {
        that.setData({
          list: res.data.data
        })
      }
    })
    // 推荐列表
    netWorkComm.netWork({
      url: 'spike_modular/Home/getSpikeListV1',
      method: "POST",
      success(res) {
        console.log('推荐')
        console.log(res.data.data)
        that.setData({
          tuijian: res.data.data,
          show: true
        })
        wx.hideLoading()
      }
    })
  },

  getInfo() {
    const that = this
    wx.getSystemInfo({
      success: function(res) {
        console.log(res)
        let pixe = res.windowWidth / 750
        let myCanvasWidth = res.windowWidth
        let myCanvasHeight = myCanvasWidth * 4 / 5
        let modelX = res.model.indexOf("iPhone X")
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
    let detail = that.data.help
    let pixe = that.data.pixe
    let price = detail.group_buy_price - 0
    let old_price = detail.origin_price - 0
    let num = detail.stock - detail.sold - detail.frozen_num
    let cover_image = detail.goods.product_img.url.replace('http://file.zhuangxiumall.cn', 'https://api.zhuangxiumall.cn')
    let head_image = detail.order_info.head_pic ? detail.order_info.head_pic.replace('http://thirdwx.qlogo.cn', 'https://wx.qlogo.cn') : '/images/ic_my_head_def@3x.png'
    console.log(head_image)
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
            let cover_text = `本活动商品由${detail.store.brand}(深圳)特约赞助`
            let cx = wx.createCanvasContext('canvas')
            cx.save();
            cx.drawImage(cover_images, 0, 0, 750 * pixe, 600 * pixe)
            cx.drawImage('/images/img_smallroutine_rectangle@2x.png', 0, 411 * pixe, 750 * pixe, 189 * pixe)
            cx.drawImage('/images/img_smallroutine1@2x.png', 496 * pixe, 0, 254 * pixe, 96 * pixe)
            cx.drawImage('/images/ic_smallroutine_circle2@2x.png', 636 * pixe, 400 * pixe, 80 * pixe, 80 * pixe)
            cx.drawImage('/images/img_pmgressbar2@2x.png', 286 * pixe, 496 * pixe, 261 * pixe, 25 * pixe)
            cx.beginPath() //开始创建一个路径
            cx.arc(576 * pixe, 440 * pixe, 40 * pixe, 0, 2 * Math.PI, false)
            //画一个圆形裁剪区域
            // cx.stroke();
            cx.clip() //裁剪
            cx.drawImage(head_images, 536 * pixe, 400 * pixe, 80 * pixe, 80 * pixe)
            // cx.stroke();
            cx.restore()
            cx.setFontSize(56 * pixe)
            cx.setFillStyle('#FFBE4D')
            cx.fillText('￥', 36 * pixe, 511 * pixe)
            cx.setFontSize(100 * pixe)
            cx.setFillStyle('#FFBE4D')
            cx.fillText('0.01', 82 * pixe, 514 * pixe)
            cx.setFontSize(45 * pixe)
            cx.setFillStyle('#fff')
            cx.fillText(`￥${old_price}`, 296 * pixe, 471 * pixe)
            cx.setStrokeStyle('white')
            cx.moveTo(296 * pixe, 451 * pixe)
            if (old_price < 10) {
              cx.lineTo(375 * pixe, 455 * pixe)
            } else if (old_price < 100) {
              cx.lineTo(395 * pixe, 455 * pixe)
            } else if (old_price < 1000) {
              cx.lineTo(425 * pixe, 455 * pixe)
            } else if (old_price < 10000) {
              cx.lineTo(455 * pixe, 455 * pixe)
            } else if (old_price < 100000) {
              cx.lineTo(485 * pixe, 455 * pixe)
            }
            cx.stroke()
            cx.setFontSize(36 * pixe)
            cx.setFillStyle('#fff')
            cx.fillText(`限量${num}件`, 564 * pixe, 525 * pixe)
            cx.setFontSize(29 * pixe)
            cx.setFillStyle('#fff')
            cx.fillText(cover_text, 36 * pixe, 582 * pixe)
            cx.draw(true, setTimeout(() => {
              wx.canvasToTempFilePath({
                canvasId: 'canvas',
                success: function(res) {
                  console.log('分享图片')
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

  // 分享图制作中
  goToast() {
    wx.showToast({
      title: '您点的太快啦！',
      icon: 'none'
    })
  },

  // 无效点击
  goClick() {
    return
  },

  // 关闭
  goAll() {
    this.setData({
      play: false,
      refund: false,
      codes: false,
      share: false,
      vest: false,
      codeLayer: false,
      code_image: ''
    })
  },

  // 查看券码
  goVolume(e) {
    const that = this
    let exchange_code = that.data.fabulous.order_info.exchange_code
    netWorkComm.netWork({
      url: 'communal/Qrcode/createQrcode',
      method: "POST",
      para: {
        info: exchange_code
      },
      success(res) {
        let code_image = wx.arrayBufferToBase64(wx.base64ToArrayBuffer(res.data.data))
        let code_image1 = "data:image/png;base64," + code_image
        that.setData({
          code_image: code_image1,
          code: true,
        }, () => {
          if (that.data.code) {
            wx.onUserCaptureScreen(function (res) {
              that.setData({
                codeLayer: true
              })
            })
          }
        })
      }
    })
  },

  webSocket(e) {
    const that = this
    if(app.globalData.but) {
      let id = that.data.fabulous.order_info.order_id
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
            wx.onUserCaptureScreen(function (res) {
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

  goLayer() {
    this.setData({
      codeLayer: false
    })
  },

  // 立即评价
  goComment() {
    let id = this.data.fabulous.order_info.order_id
    let activity_id = this.data.fabulous.id
    let price = this.data.fabulous.group_buy_price
    let name = this.data.fabulous.goods.product_name
    let img_url = this.data.fabulous.goods.product_img.url
    let type = "spike"
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/goAssemble/comment?order_id=${id}&price=${price}&name=${name}&img_url=${img_url}&type=${type}&activity_id=${activity_id}`,
      })
    }
    app.but()
  },

  // 滚动穿透
  preventMove() {
    return
  },

  // 关闭
  goClose() {
    this.setData({
      play: false
    })
  },

  // 去首页看看
  toIndex() {
    if (app.globalData.but) {
      wx.switchTab({
        url: '/pages/index/index',
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

  // 倒计时
  countDown(time) {
    const that = this
    if (that.data.exchange_time > 0) {
      let countDownNum = that.data.exchange_time
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
    } else {
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
    }
  },

  // countDown1(time) {
  //   const that = this
  //   let countDownNum1 = that.data.exchange_time
  //   if (countDownNum1 > 0) {
  //     let timeOut1 = setInterval(() => {
  //       countDownNum1--;
  //       that.setData({
  //         countDownNum1
  //       })
  //       if (that.data.countDownNum1 == 0) {
  //         clearInterval(timeOut1)
  //       }
  //     }, 1000)
  //     that.setData({
  //       timeOut1
  //     })
  //   } else {
  //     that.setData({
  //       countDownNum1
  //     })
  //   }
  // },

  // 砍价记录
  goCore() {
    let order_sn = this.data.order_sn
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/goPayment/praise?order_sn=${order_sn}`,
      })
    }
    app.but()
  },

  // 帮好友砍价
  goHelp() {
    const that = this
    if (app.globalData.but) {
      netWorkComm.netWork({
        url: 'spike_modular/SpikeOrder/likes',
        method: 'POST',
        para: {
          order_sn: that.data.order_sn
        },
        success(res) {
          console.log('帮好友砍价')
          console.log(res)
          if(res.data.code=='60007') {
            that.setData({
              vest: true
            })
          }else {
            let status = res.data.status
            let code = res.data.code
            if (status == 'success') {
              netWorkComm.netWork({
                url: 'spike_modular/SpikeOrder/orderInfo',
                para: {
                  order_sn: that.data.options.order_sn,
                  is_check: '0'
                },
                success(res) {
                  console.log('本人数据')
                  console.log(res)
                  that.setData({
                    order_status: res.data.data.order_info.order_status,
                    likes: res.data.data.order_info.has_spike_likes,
                  })
                }
              })
              // 砍价记录
              netWorkComm.netWork({
                url: 'spike_modular/SpikeOrder/getOrderLikes',
                method: 'POST',
                para: {
                  order_sn: that.data.options.order_sn
                },
                success(res) {
                  that.setData({
                    list: res.data.data,
                    // likes: 
                  })
                }
              })
              if (wx.getStorageSync('spikeStatus14') != 'done') {
                netWorkComm.netWork({
                  url: 'spike_modular/Task/getList',
                  method: 'POST',
                  success(res) {
                    let code14 = res.data.data.list.filter((item, index) => {
                      return (item.id == 14)
                    })
                    let spikeStatus = code14[0].status
                    if (spikeStatus == 2) {
                      that.setData({
                        first: true,
                        spot: true
                      }, () => {
                        console.log('spot状态1')
                        console.log(that.data.spot)
                      })
                      wx.setStorageSync('spikeStatus14', 'done')
                    }
                  }
                })
              } else {
                that.setData({
                  first: false,
                  spot: true
                }, () => {
                  console.log('spot状态2')
                  console.log(that.data.spot)
                })

              }
            } else {
              that.setData({
                codes: true
              })
            }
          }
        }
      })
    }
    app.but()
  },

  // 我也要免费领
  goIndex() {
    if (app.globalData.but) {
      wx.switchTab({
        url: '/pages/index/treasure'
      })
    }
    app.but()
  },

  // 其他免费领
  goOther(e) {
    console.log(e)
    let activity_id = this.data.tuijian[e.currentTarget.dataset.index].activity_id
    wx.navigateTo({
      url: `/pages/details/treasure?activity_id=${activity_id}`
    })
    console.log(e)
  },

  // 授权登录
  bindgetuserinfo(e) {
    const that = this
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
                console.log('砍价登录')
                console.log(res)
                let openId = res.data.data.three_user.openId
                let unionId = res.data.data.three_user.unionId
                let head_pic = res.data.data.three_user.avatarUrl
                let nickName = res.data.data.three_user.nickName
                that.setData({
                  phone: true,
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

  getPhoneNumber(e) {
    console.log(e)
    const that = this
    that.setData({
      phone: false
    })
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
          console.log(res)
          wx.setStorageSync('token', res.data.msg.token)
          if (res.data.status == 'success') {
            that.goHelp()
          }
          that.setData({
            token: wx.getStorageSync('token')
          })
        }
      })
    } else {
      wx.showToast({
        title: '未绑定手机号',
        icon: 'none'
      })
    }
  },

  // 退款详情
  gorefund() {
    let order_sn = this.data.fabulous.order_info.order_sn
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/goAssemble/refund?order_sn=${order_sn}&type=${'spike'}`
      })
    }
    app.but()
  },

  // 砍价详情
  goRecord() {
    let order_sn = this.data.help.order_info.order_sn
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/goPayment/praise?order_sn=${order_sn}`,
      })
    }
    app.but()
  },

  // 商家信息
  goStore() {
    let store_id = this.data.fabulous.store.id
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/goStore/index?store_id=${store_id}`,
      })
    }
    app.but()
  },

  // 打电话
  goIphon() {
    const that = this
    if (app.globalData.but) {
      wx.makePhoneCall({
        phoneNumber: that.data.fabulous.store.mobile
      })
    }
    app.but()
  },

  // 买
  goShop() {
    let activity_id = this.data.fabulous.id
    if (app.globalData.but) {
      wx.navigateTo({
        url: `/pages/details/treasure?activity_id=${activity_id}`,
      })
    }
    app.but()
  },

  // 退款
  goRefund() {
    this.setData({
      refund: true,
      showView: true
    })
  },

  // input 获取信息
  textInput(e) {
    this.setData({
      value: e.detail.value
    })
  },

  // 退款原因
  goRefundText() {
    const that = this
    let order_sn = that.data.fabulous.order_info.order_sn
    let order_id = that.data.fabulous.order_info.order_id
    let value = that.data.value
    if (app.globalData.but) {
      if (value) {
        netWorkComm.netWork({
          url: 'payment_modular/CommonPay/refundOrder',
          method: 'POST',
          para: {
            order_id: order_id,
            refund_reason: that.data.value,
          },
          success(res) {
            console.log('退款原因')
            console.log(res)
            that.setData({
              refund: !that.data.refund
            })
            wx.redirectTo({
              url: `/pages/goAssemble/refund?order_sn=${order_sn}&type=${'spike'}`,
            })
            app.getList()
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
    that.getMyInfo()
    let progress_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAAA4CAMAAAALkqCbAAAAkFBMVEVHcEz6Uk74UU//AAD5Uk74Uk74Uk75U034Uk7/VVX5Uk74VU76Uk34U074Uk77UU3/VUT4Uk74Uk72VE/6Uk/5Uk78U0/5Uk31Tk75Uk/4U0z5U034Uk76UlD4UU34Uk7/VUr4U075Uk74Uk35Uk75UU7/VVX5U0//UFD4UE34Uk76Uk74UU74Uk/5UU74Uk76M9jyAAAAL3RSTlMAk7wC8o/UK/wG/iQ43vJCD4zpOmTfSnoaq01Tu2b++hiXy+r1Wwl4EEm9j/vTqZH6Zt8AAADVSURBVFjD7dhHDsJAEETRMk5jk3POOc79b4cxCAFm7WrJ/fcjvcVsuoCk0A88S8gL/BDPIsdYWsaJUkPJUis9FI4l5yT/wbARJoRv6fkI+IgAHh/hwQpIEYpQhCIUoQhFKEIRilCEIoqBEHEGijiIRUwDIkYSEXORjOFMxIQoY0z9Wyf7JB4j724ZxDJ3AxrVH8N1lz8ClfmXYROC0f4LMaUY4E4+DEOQWrTehu6BhcBx9jJc2uDVfCH6RAOiVWo4uUwEyrXEsB6A2za2pgd2o3MdhegOigwEhrWw0HYAAAAASUVORK5CYII="
    that.setData({
      progress_image,
      token: wx.getStorageSync('token')
    })
    if (wx.getStorageSync('spikeStatus') == 'done') {
      that.setData({
        spikeStatus: false
      })
    } else {
      that.setData({
        spikeStatus: true
      })
    }
  },

  goChange() {
    this.setData({
      spot: false,
      goInto: 'into'
    })
  },

  // 完成任务
  goTask() {
    const that = this
    netWorkComm.netWork({
      url: 'spike_modular/Task/receiveReward',
      method: 'POST',
      para: {
        task_id: 13
      },
      success(res) {
        that.setData({
          exchangeStatus: false,
        })
      }
    })
  },

  // 完成任务
  goTask1() {
    const that = this
    netWorkComm.netWork({
      url: 'spike_modular/Task/receiveReward',
      method: 'POST',
      para: {
        task_id: 14
      },
      success(res) {
        that.setData({
          spot: false,
          goInto: 'into'
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    app.globalData.but = true
    clearInterval(this.data.timeOut)
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
    console.log('砍价分享码')
    console.log(wx.getStorageSync('from_order_sn'))
    console.log(wx.getStorageSync('share_number'))
    this.getMyInfo()
  },

  // scrolltoper() {
  //   console.log('砍价分享码')
  //   console.log(wx.getStorageSync('from_order_sn'))
  //   console.log(wx.getStorageSync('share_number'))
  //   this.getMyInfo()
  // },

  /**
   * 页面上拉触底事件的处理函数
   */
  scrolltolower() {
    const that = this
    //免费领列表
    netWorkComm.netWork({
      url: 'spike_modular/Home/getSpikeListV1',
      method: 'POST',
      para: {
        lat: wx.getStorageSync('lat'),
        lng: wx.getStorageSync('lng'),
        p: that.data.p + 1
      },
      success: function(res) {
        console.log('上拉触底')
        console.log(res)
        if (res.data.data) {
          console.log(res.data.data)
          let list = that.data.treasure.list.concat(res.data.data)
          console.log(list)
          that.setData({
            p: that.data.p + 1,
            'treasure.list': list
          })
        }
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    const that = this
    that.setData({
      share: false
    })
    let order_sn = that.data.order_sn
    return {
      title: '只花你一秒，让我把它带回家！',
      path: `/pages/goPayment/help?order_sn=${order_sn}&invitation_type=${wx.getStorageSync('invitation_type')}&parent_id=${wx.getStorageSync('parent_id')}&register_scene=${wx.getStorageSync('register_scene')}&share_number=${wx.getStorageSync('share_number')}&from_order_sn=${order_sn}`,
      imageUrl: that.data.shareImage
    }
  }
})