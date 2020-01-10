import Dialog from '@vant/weapp/dialog/dialog';
import Notify from '@vant/weapp/notify/notify';

const db = wx.cloud.database();
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    courseList: []
  },

  getCourseList: function() {
    wx.showLoading({});
    db.collection('course').where({
      _openid: app.globalData.openid 
    })
      .orderBy('day', 'asc')
      .orderBy('start', 'asc')
      .get()
      .then(res => {
        if (res.data.length === 0) {
          Notify({ type: 'primary', message: 'No Course，Please Add' });
        }
        for (let i = 0; i < res.data.length; i++) {
          if (res.data[i].day == 1) {
            res.data[i].day = "Monday"
          }
          if (res.data[i].day == 2) {
            res.data[i].day = "Tuesday"
          }
          if (res.data[i].day == 3) {
            res.data[i].day = "Wednesday"
          }
          if (res.data[i].day == 4) {
            res.data[i].day = "Thursday"
          }
          if (res.data[i].day == 5) {
            res.data[i].day = "Friday"
          }
        };
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
  //添加课程
  addCourse: function() {
    wx.navigateTo({
      url: `../courseEdit/courseDetail?type=add`
    });
  },
  //编辑课程
  editCourse: function(event){
    wx.navigateTo({
      url: `../courseEdit/courseDetail?type=edit&courseId=${event.target.dataset.courseid}`
    });
  },
  //删除确认
  showDeleteConfirm: function(event) {
    let id = event.target.dataset.courseid;
    Dialog.confirm({
      title: 'Confirm',
      message: 'Delete This Course?',
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel'
    }).then(() => {
      // on confirm
      this.deleteCourse(id);
    }).catch(() => {
      
    });
  },
  //删除课程
  deleteCourse: function(id) {
    wx.showLoading({
      title: 'Deleting',
    })
    db.collection('course')
      .doc(id)
      .remove()
      .then(res => {
        wx.hideLoading();
        Notify({ type: 'success', message: 'Deleted Successfully!' });
        this.setData({
          courseList: []
        });
        this.getCourseList();

      }).catch(err => {
        Notify({
          type: 'danger',
          message: 'Sever Error, Please Contact WeChat mum8u6'
        });
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
    this.getCourseList();
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