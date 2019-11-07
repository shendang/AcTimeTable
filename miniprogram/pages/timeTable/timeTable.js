import Notify from 'vant-weapp/notify/notify';

const db = wx.cloud.database();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    imagePath_sleepy: "/images/sleep.png",
    imagePath_bed: "/images/bed.png",
    imagePath_edit: "/images/edit.png",
    time: ["8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00",
           "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", 
           "22:00"],
    weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    courseList: []
  },

  // 获取当前用户的课程信息
  getUserCourseInfo: function(){
    wx.showLoading({
    });
    db.collection('course').get().then(res=>{
      if (res.data.length === 0) {
        Notify({ type: 'primary', message: '暂无课程，请点击左上角编辑课程' });
      }
      this.setData({
        courseList: this.data.courseList.concat(res.data)
      });
      wx.hideLoading();
    }).catch(err=>{
      Notify({ type: 'danger', message: '服务器错误，请联系管理员，微信：mum8u6' });
      wx.hideLoading();
    })
  },
  
  //插入课程信息
  insertCourse: function(){
    db.collection('course').add({
      data: {
      }
    }).then(res=>{
      console.log(res)
    }).catch(err=>{
      console.log(err)
    })
  },

  editCourse: function(){
    wx.navigateTo({
      url: '../course/courseList',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    
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
    this.setData({
      courseList: []
    });
    this.getUserCourseInfo();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})