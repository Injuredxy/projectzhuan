Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    // 这里定义了config属性，属性值可以在组件使用时指定
    config: {
      type: 'object',
      observer: function (res) {
        if (res.type != 'loading') {
          this.process(res)
        }
      }
    }
  },
  data: {
    current: {
    },
    default: {
      list: {
        login: {
          msg: '还没登陆哟',
          btn: '去登陆',
          callback: 'login'
        },
        record: {
          icon: '/images/ic_down_def@2x.png'
        }
      }
    }
  },
  methods: {
    process: function (res) {
      const df = this.data.default
      this.data.current.icon = df.list[res.type].icon

      if (res.msg) {
        this.data.current.msg = res.msg
      } else if (df.list[res.type].msg) {
        this.data.current.msg = df.list[res.type].msg
      } else {
        this.data.current.msg = ''
      }

      if (res.btn) {
        this.data.current.btn = res.btn
      } else if (df.list[res.type].btn) {
        this.data.current.btn = df.list[res.type].btn
      } else {
        this.data.current.btn = ''
      }

      if (res.callback) {
        this.data.current.callback = res.callback
      } else if (df.list[res.type].btn) {
        this.data.current.callback = df.list[res.type].callback
      }

      this.setData({
        current: this.data.current
      })
    },
    // 点击去登陆
    tap: function () {
      var callback = this.data.current.callback
      if (typeof callback == 'string') {
        switch (callback) {
          case 'login':
            wx.navigateTo({
              url: '/pages/login/login',
            })
            break
        }
      } else {

      }
    }
  }
})
