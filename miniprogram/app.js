//app.js
App({
  onLaunch: function () {

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }

    this.globalData = {
      openid: null,
      weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      time: ["8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00",
        "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00",
        "22:00"
      ]
    }

    this.getOpenid();
    this.getUserInfo();
  },

  getOpenid: function () {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid);
        this.globalData.openid = res.result.openid;
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },

  getUserInfo: function () {
    let that =this;
    // 必须是在用户已经授权的情况下调用
    wx.getUserInfo({
      success: function (res) {
        var userInfo = res.userInfo
        that.globalData.nickName = userInfo.nickName
        that.globalData.avatarUrl = userInfo.avatarUrl
        that.globalData.gender = userInfo.gender //性别 0：未知、1：男、2：女
        that.globalData.province = userInfo.province
        that.globalData.city = userInfo.city
        that.globalData.country = userInfo.country
      }
    })
  }
})