const netWorkComm = require("../../utils/network.js")
const app = getApp()
const Config = require('../../utils/config.js')
let SocketTask
let timeOut = ''

Component({

  behaviors: [],

  properties: {
    'value': { // 属性名
      type: String
    },
    'type': {
      type: Number
    },
    'goodType': {
      type: String,
      value: ''
    },
    myProperty2: String // 简化的定义方式
  },

  data: {
    socketStatus: false,
    message: ''
  }, // 私有数据，可用于模板渲染

  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function() {
      this.goSocket()
    },
    moved: function() {

    },
    detached: function() {
      console.log('detached', this.data.socketStatus)
      if (this.data.socketStatus) {
        SocketTask.close()
        console.log('关闭长链接')
        this.setData({
          socketStatus: false,
          socketType: 'none'
        })
      }
      clearTimeout(timeOut)
    },
  },

  // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
  attached: function() {}, // 此处attached的声明会被lifetimes字段中的声明覆盖
  ready: function() {},

  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function() {
      console.log('onshow', this.data.socketStatus)
      if (!this.data.socketStatus) {
        this.goSocket()
      }
      console.log(this.data.socketType)
      timeOut = setTimeout(() => {
        if (this.data.socketType == 'ping' || this.data.socketType == 'none') {
          this.goSocket()
        }
      }, 4000)
    },
    hide: function() {
      console.log('onhide', this.data.socketStatus)
      app.globalData.but = true
      if (this.data.socketStatus) {
        SocketTask.close()
        console.log('关闭长链接')
        this.setData({
          socketStatus: false,
          socketType: 'none'
        })
      }
      clearTimeout(timeOut)
    },
    resize: function() {

    },
  },

  methods: {
    onMyButtonTap: function() {
      this.setData({
        // 更新属性和数据的方法与更新页面数据的方法类似
      })
    },
    goAnimation() {
      this.setData({
        message: this.data.message1
      })
      console.log(this.data.message)
    },
    goStart() {
      this.setData({
        message: this.data.message1
      })
    },
    goList() {
      if(app.globalData.but) {
        let itemStatus = this.data.message.indexOf('拼团成功')
        console.log(itemStatus)
        if (itemStatus != '-1') {
          wx.navigateTo({
            url: `/pages/goAssemble/list?current=${2}`,
          })
        } else {
          wx.navigateTo({
            url: `/pages/goAssemble/list?current=${1}`,
          })
        }
      }
      app.but()
    },
    goSocket() {
      const that = this
      SocketTask = wx.connectSocket({
        url: Config.SocketUrl,
        success: function(res) {
          console.log('WebSocket连接创建', res)
          that.setData({
            socketStatus: true
          })
        },
        fail: function(err) {
          wx.showToast({
            title: '网络异常！',
          })
          console.log(err)
        },
      })
      SocketTask.onOpen(res => {
        console.log('WebSocket连接打开-----。', res)
        let old_data = {
          type: "join_deal_dynamic",
          dynamic_type: that.data.type
        }
        let new_data = JSON.stringify(old_data)
        wx.sendSocketMessage({
          data: new_data
        })
      })
      SocketTask.onMessage(res => {
        let obj1 = JSON.parse(res.data)
        if (obj1.type == "push_deal_dynamic") {
          let activityList1 = obj1.data
          let message1 = `<div class='flex-cc'>${activityList1.message.replace('<!user_head_pic!>', ` < img class="barrage-image" src = ${activityList1.user_head_pic}></img > `).replace('<!nickname!>', ` < div class="socket-name" > ${activityList1.nickname}</div >`)}
            </div>`
          that.setData({
            message1,
            socketType: obj1.type
          })
        }
      })
    },
    // 内部方法建议以下划线开头
    _myPrivateMethod: function() {
      // 这里将 data.A[0].B 设为 'myPrivateData'
      this.setData({
        'A[0].B': 'myPrivateData'
      })
    },
    _propertyChange: function(newVal, oldVal) {

    }
  }
})