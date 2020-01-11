import Notify from '@vant/weapp/notify/notify';

const db = wx.cloud.database();
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    imagePath_sleepy: "/images/sleep.png",
    imagePath_bed: "/images/bed.png",
    imagePath_edit: "/images/edit.png",
    imagePath_menu: "/images/menu.png",
    time: ["8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00",
      "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00",
      "22:00"
    ],
    weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    courseList: [],
    showMenu: false
  },

  //展示侧边菜单栏
  showLeftMenu: function () {
    this.setData({
      showMenu: true
    })
  },

  //隐藏侧边菜单栏
  hideLeftMenu: function () {
    this.setData({
      showMenu: false
    })
  },

  //获取用户openId
  getOpenid: function () {
    wx.showLoading();
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid);
        app.globalData.openid = res.result.openid;
        this.getUserCourseInfo();
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },
  // 获取当前用户的课程信息
  getUserCourseInfo: function () {
    wx.showLoading({});
    db.collection('course').where({
      _openid: app.globalData.openid
    }).get().then(res => {
      if (res.data.length === 0) {
        Notify({
          type: 'primary',
          message: 'No Course，Please Add'
        });
      }
      this.setData({
        courseList: this.data.courseList.concat(res.data)
      });
      wx.hideLoading();
    }).catch(err => {
      Notify({
        type: 'danger',
        message: 'Sever Error, Please Contact WeChat mum8u6'
      });
      wx.hideLoading();
    })
  },

  //插入课程信息
  insertCourse: function () {
    db.collection('course').add({
      data: {}
    }).then(res => {
      console.log(res)
    }).catch(err => {
      console.log(err)
    })
  },

  editCourse: function () {
    wx.navigateTo({
      url: '../course/courseList',
    })
  },

  toUpload:function(){
    wx.navigateTo({
      url: '../upload/upload',
    })
  },
 
  shouwMap: function () {
    wx.navigateTo({
      url: '../map/map',
    })
  },

  toFollowList: function () {
    wx.navigateTo({
      url: '../follow/followList',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getOpenid();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('onShow')
    this.setData({
      courseList: []
    });
    this.getOpenid();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'menu') {
      return {
        title: 'Ac TimeTable',
        path: `/pages/timeTable/timeTable`
      }
    } else {

      this.setData({
        showMenu: false
      });
      return {
        title: 'Share My TimeTable',
        path: `/pages/share/share?shareOpenid=${app.globalData.openid}&from=share`
      }
    }
  }
})