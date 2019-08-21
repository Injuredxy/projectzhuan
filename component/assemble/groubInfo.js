const netWorkComm = require("../../utils/network.js")
const Config = require('../../utils/config.js')
const app = getApp()

Component({

  behaviors: [],

  // 属性定义（详情参见下文）
  properties: {
    fabulous: { // 属性名
      type: Object,
      value: ''
    },
    myProperty2: String // 简化的定义方式
  },

  data: {
    p: 1,
  }, // 私有数据，可用于模板渲染

  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function() {
      const that = this
      netWorkComm.netWork({
        url: 'index_modular/IndexShow/getMarketProduct',
        para: {
          store_id: that.data.fabulous.store.id,
          p: 1,
          page_size: 6
        },
        success(res) {
          console.log('推荐', res)
          that.setData({
            tuijian: res.data.data,
            show: true
          })
          wx.hideLoading()
        }
      })
    },
    moved: function() {},
    detached: function() {},
  },

  // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
  attached: function() {}, // 此处attached的声明会被lifetimes字段中的声明覆盖
  ready: function() {},

  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function() {},
    hide: function() {},
    resize: function() {},
  },

  methods: {
    onMyButtonTap: function() {
      this.setData({
        // 更新属性和数据的方法与更新页面数据的方法类似
      })
    },
    // 商家信息
    goStore() {
      let store_id = this.data.fabulous.store.id
      if (app.globalData.but) {
        wx.navigateTo({
          url: `/pages/goStore/index?store_id=${store_id}`
        })
      }
      app.but()
    },
    // 电话
    goIphon() {
      const that = this
      wx.makePhoneCall({
        phoneNumber: that.data.fabulous.store.mobile
      })
    },
    goOther(e) {
      console.log(e)
      let type = e.currentTarget.dataset.item.type
      let activity_id = e.currentTarget.dataset.item.data.activity_id
      if (type == 'spike') {
        wx.navigateTo({
          url: `/pages/details/treasure?activity_id=${activity_id}`,
        })
      } else if (type == 'temai') {
        wx.navigateTo({
          url: `/pages/details/sample?activity_id=${activity_id}`,
        })
      } else if (type == 'group_buy') {
        wx.navigateTo({
          url: `/pages/details/assemble?activity_id=${activity_id}`,
        })
      }
    },
    // 页面上拉触底事件的处理函数
    getMoreGroup: function() {
      const that = this
      //聚拼团列表
      netWorkComm.netWork({
        url: 'index_modular/IndexShow/getMarketProduct',
        para: {
          store_id: that.data.fabulous.store.id,
          p: that.data.p + 1,
          page_size: 6
        },
        success(res) {
          console.log('推荐', res)
          if(res.data.data) {
            let tuijian1 = that.data.tuijian.concat(res.data.data)
            that.setData({
              tuijian: tuijian1,
              p: that.data.p + 1,
              page_size: 6
            })
          }
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