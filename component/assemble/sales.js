const netWorkComm = require("../../utils/network.js")
const Config = require('../../utils/config.js')
const app = getApp()

Component({

  behaviors: [],

  // 属性定义（详情参见下文）
  properties: {
    vest: { // 属性名
      type: Object,
      value: ''
    },
    myProperty2: String // 简化的定义方式
  },

  data: {}, // 私有数据，可用于模板渲染

  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function () { },
    moved: function () { },
    detached: function () { },
  },

  // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
  attached: function () {
  }, // 此处attached的声明会被lifetimes字段中的声明覆盖
  ready: function () { },

  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () { },
    hide: function () { },
    resize: function () { },
  },

  methods: {
    onMyButtonTap: function () {
      this.setData({
        // 更新属性和数据的方法与更新页面数据的方法类似
      })
    },
    // 商家信息
    goStore() {},
    // 电话
    goIphons(e) {
      const that = this
      let mobile = e.currentTarget.dataset.mobile
      wx.makePhoneCall({
        phoneNumber: mobile
      })
    },
    // 内部方法建议以下划线开头
    _myPrivateMethod: function () {
      // 这里将 data.A[0].B 设为 'myPrivateData'
      this.setData({
        'A[0].B': 'myPrivateData'
      })
    },
    _propertyChange: function (newVal, oldVal) {

    }
  }

})