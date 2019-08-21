const app = getApp()
Component({
  options: {
    addGlobalClass: true
  },
  properties: {

  },
  data: {
    show: false,
    code: ''
  },
  methods: {
    show: function (e) {
      this.setData({
        show: true,
        code: e.code,
        limit: e.limit
      })
    },
    hide: function () {
      this.setData({
        show: false
      })
    }
  }
})
