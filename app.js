const common = require('/js/common.js')
const util = require('/utils/util.js')
const netWorkComm = require("/utils/network.js")
let SocketTask
const Config = require('/utils/config.js')
let socketOpen = true

App({
  common: common,
  data: {
    location: '', //用户定位
    userInfo: '',
  },

  onLaunch: function() {
    // 登录
    const that = this
    wx.login({
      success: res => {
        wx.request({
          url: `${Config.BaseUrl}user/ThreeUser/miniLoginByCode`,
          data: {
            code: res.code
          },
          method: 'POST',
          success: res => {
            console.log('登录code')
            console.log(res)
            that.globalData.tokenStatus = res.data.msg;
            if (that.tokenStatusCallback) {
              that.tokenStatusCallback(res.data.msg)
            }
            if (res.data.data.three_user) {
              wx.setStorageSync('token', "")
            } else if (res.data.data.user) {
              wx.setStorageSync('token', res.data.data.user.token)
              netWorkComm.netWork({
                url: 'user/User/userInfo',
                method: "POST",
                success(res) {
                  wx.setStorageSync('user_id', res.data.data.id)
                }
              })
              // netWorkComm.netWork({
              //   url: 'user/User/orderListV1',
              //   method: "POST",
              //   para: {
              //     order_status_type: 'WAIT_FINISH',
              //     p: "1",
              //     page_size: "100"
              //   },
              //   success(res) {
              //     console.log('未完成订单')
              //     console.log(res)
              //     if (res.data.status === "success") {
              //       if (res.data.data) {
              //         that.globalData.orderAll = 'true'
              //       } else {
              //         that.globalData.orderAll = 'false'
              //       }
              //     }
              //   }
              // })
              that.getList()
            }
          },
          fail(err) {
            wx.showToast({
              title: '系统异常，请重试!',
              icon: 'none'
            })
          }
        })
      }
    })
  },

  goSocket() {
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
        type: "join_deal_dynamic"
      }
      let new_data = JSON.stringify(old_data)
      wx.sendSocketMessage({
        data: new_data
      })
    })
    SocketTask.onMessage(res => {
      let obj1 = JSON.parse(res.data)
      console.log('第一次长连接')
      console.log(obj1)
      if (obj1.type == 'reply_order') {
        that.globalData.socketMsg = obj1.data
      } else if (obj1.type == 'push_order') {
        that.globalData.socketMsg = that.globalData.socketMsg.concat(obj1.data)

      }
      console.log('服务器返回的消息1', res)
    })
  },

  onError() {
    wx.showToast({
      title: '脚本错误或 API 调用报错',
      icon: 'none'
    })
  },

  location() {
    wx.getLocation({
      success: function(res) {
        wx.setStorageSync('lat', res.latitude)
        wx.setStorageSync('lng', res.longitude)
      },
    })
  },

  but() {
    this.globalData.but = false
    setTimeout(() => {
      this.globalData.but = true
    }, 2000)
  },

  butPay() {
    this.globalData.but = false
    console.log(1)
    setTimeout(() => {
      this.globalData.but = true
    }, 5000)
  },

  getList() {
    const that = this
    netWorkComm.netWork({
      url: 'user/User/orderListV1',
      method: "POST",
      para: {
        order_status_type: 'WAIT_FINISH',
        p: "1",
        page_size: "100"
      },
      success(res) {
        console.log('未完成订单')
        console.log(res)
        if (res.data.status === "success") {
          if (res.data.data) {

            let orderList = []
            res.data.data.map(item => {
              orderList.push({
                order_lists: item.order_lists
              })
            })
            let orderList1 = []
            orderList.map(item => {
              item.order_lists.map(item => {
                orderList1.push(item)
              })
            })
            console.log('订单', orderList1)
            that.globalData.orderList = orderList1
            that.globalData.orderLength = orderList1.length
            let orderStatus = orderList1[0]
            let minOrderStatus = that.time(orderList1[0].order.add_time)
            orderList1.map(item => {
              let time = that.time(item.order.add_time)
              if (time < minOrderStatus) {
                minOrderStatus = time
                orderStatus = item
              }
            })
            that.globalData.orderStatus = orderStatus
          } else {
            that.globalData.orderLength = 0
          }
        }
      }
    })
  },

  // 倒计时
  countDown(time) {
    const that = this
    let countDownNum = time
    // console.log(time)
    if (countDownNum > 0 && countDownNum < 86401) {
      let timeOut = setInterval(() => {
        countDownNum--;
        that.globalData.countDownNum = countDownNum
        console.log(countDownNum)
        if (that.data.countDownNum == 0) {
          clearInterval(timeOut)
        }
      }, 1000)
      that.globalData.timeOut = timeOut
    } else {
      that.globalData.countDownNum = countDownNum
    }
  },

  time(time) {
    let date = time;
    date = date.substring(0, 19);
    date = date.replace(/-/g, '/');
    let timestamp = new Date(date).getTime();
    return timestamp
  },

  globalData: {
    userInfo: null,
    tokenStatus: '',
    but: true,
    orderLength: '',
    orderStatus: '',
    orderList: '',
    orderAll: '',
    countDownNum: '',
    timeOut: '',
    socketMsg: '',
    orderIndex: 0
  },
})