import Toast from '@vant/weapp/toast/toast';
import Notify from '@vant/weapp/notify/notify';

const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    maxHour_startTime: 21,
    minHour_startTime: 8,
    maxHour_endTime: 22,
    minHour_endTime: 9,
    type: 'Theory',
    columns: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    weekdayShow: false,
    startTimeShow: false,
    endTimeShow: false,
    currentDate: '12:00',
    weekday: "",
    startTime: "",
    endTime: "",
    name: "",
    room: "",
    filter(type, options) {
      if (type === 'minute') {
        return options.filter(option => option % 30 === 0)
      }
      return options;
    },

  },

  onRadioChange(event) {
    this.setData({
      type: event.detail
    });
  },

  onRadioClick(event) {
    const {
      name
    } = event.currentTarget.dataset;
    this.setData({
      type: name
    });
  },

  showWeekdays: function() {
    this.setData({
      weekdayShow: true
    })
  },

  onWeekdayCancel: function() {
    this.setData({
      weekdayShow: false
    })
  },

  onWeekdayConfirm: function(event) {
    const {
      picker,
      value,
      index
    } = event.detail;
    this.setData({
      weekdayShow: false,
      weekday: value
    })
  },

  showStartTime: function() {
    this.setData({
      startTimeShow: true
    })
  },

  onStartTimeCancel: function() {
    this.setData({
      startTimeShow: false
    })
  },

  //需计算结束时间最小值
  onStratTimeConfirm: function(event) {
    let value = event.detail;
    let minute = value.slice(-2);
    if (minute === '01') {
      value = value.substr(0, 3) + '30';
    }
    this.setData({
      startTimeShow: false,
      startTime: value,
      minHour_endTime: parseInt(value.substr(0, 2)) + 1
    })
  },


  showEndTime: function() {
    this.setData({
      endTimeShow: true
    })
  },

  onEndTimeCancel: function() {
    this.setData({
      endTimeShow: false
    })
  },

  //需计算开始时间最大值
  onEndTimeConfirm: function(event) {
    let value = event.detail;
    let minute = value.slice(-2);
    if (minute === '01') {
      value = value.substr(0, 3) + '30';
    }
    this.setData({
      endTimeShow: false,
      endTime: value,
      maxHour_startTime: parseInt(value.substr(0, 2)) - 1
    })
  },

  onEndTimeInput(event) {
    this.setData({
      currentDate: event.detail
    });
  },

  onTypeChange(event) {
    this.setData({
      checked: event.detail
    });
  },
  onNameChange: function(event) {
    this.setData({
      name: event.detail
    })
  },

  onRoomChange: function(event) {
    this.setData({
      room: event.detail
    })
  },

  //计算课程时长，一小时计作 2
  getCourseLong: function() {
    let startTime = this.data.startTime;
    let startHour = parseInt(startTime.substr(0, 2));
    let startMinute = parseInt(startTime.slice(-2));

    let endTime = this.data.endTime;
    let endHour = parseInt(endTime.substr(0, 2));
    let endMinute = parseInt(endTime.slice(-2));

    let hourLong = endHour - startHour;

    let minuteLong;

    if (endMinute > startMinute) {
      minuteLong = 1;
    } else if (endMinute < startMinute) {
      minuteLong = -1;
    } else {
      minuteLong = 0;
    }
    let long = hourLong * 2 + minuteLong;
    return long;
  },

  //根据课程时长限制name的输入长度，确保显示体验
  checkNameLength: function(couresLong){
    let maxNameLength = (couresLong-1)*11;
    if(this.data.name.length>maxNameLength){
      Notify({
        type: 'danger',
        message: `Name no more than ${maxNameLength} characters`
      });
      return false;
    }
    return true;
  },

  //保存课程
  saveCourse: function() {
    if (!this.checkForm()) {
      return;
    }
    let long = this.getCourseLong();
    if(!this.checkNameLength(long)){
      return;
    }
    wx.showLoading({
    });
    let course = {
      name: this.data.name,
      room: this.data.room,
      startTime: this.data.startTime,
      endTime: this.data.endTime,
      day: this.getDay(),
      type: this.data.type,
      long: long,
      start: this.getStart()
    }
    if (this.data.optionType == 'edit') {
      db.collection('course').doc(this.data.courseId)
        .update({
          data: course
        }).then(res => {
          wx.hideLoading();
          Notify({
            type: 'success',
            message: 'Saved Successfully!'
          });
          setTimeout(() => {
            wx.navigateBack();
          }, 1000);
        }).catch(err => {
          Notify({
            type: 'danger',
            message: 'Sever Error, Please Contact Customer Serveice'
          });
          console.log(err);
        })
    } else {


      db.collection('course').add({
        data: course
      }).then(res => {
        wx.hideLoading();
        Notify({
          type: 'success',
          message: 'Saved Successfully!'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1000);
      }).catch(err => {
        Notify({
          type: 'danger',
          message: 'Sever Error, Please Contact Customer Serveice'
        });
        console.log(err);
      })
    }
  },

  //星期几
  getDay: function() {
    if (this.data.weekday == 'Monday') {
      return 1;
    }
    if (this.data.weekday == 'Tuesday') {
      return 2;
    }
    if (this.data.weekday == 'Wednesday') {
      return 3;
    }
    if (this.data.weekday == 'Thursday') {
      return 4;
    }
    if (this.data.weekday == 'Friday') {
      return 5;
    }

  },

  //计算起点
  getStart: function() {
    let minuteStart = (this.data.startTime.slice(-2)=='00'?0:1);
    return (parseInt(this.data.startTime.substr(0, 2)) - 8) * 2 + 1+minuteStart;
  },
  //校验必填项
  checkForm: function() {
    if (this.data.name != "" && this.data.room != "" && this.data.weekday != "" && this.data.startTime != "" && this.data.endTime != "") {
      return true;
    } else {
      Notify({
        type: 'danger',
        message: 'Please Complete Info'
      });
      return false;
    }
  },


  //获取课程信息
  getCourseInfo: function(id) {
    wx.showLoading({});
    db.collection('course')
      .doc(id)
      .get()
      .then(res => {
        wx.hideLoading();
        let weekday = this.getWeekday(res.data.day);
        this.setData({
          name: res.data.name,
          room: res.data.room,
          type: res.data.type,
          startTime: res.data.startTime,
          endTime: res.data.endTime,
          weekday: weekday
        });
        console.log(res);
      }).catch(err => {
        wx.hideLoading();
        Notify({
          type: 'danger',
          message: 'Sever Error, Please Contact Customer Serveice'
        });
      });
  },
  //获取weekday
  getWeekday: function(day) {
    if (day == 1) {
      return "Monday"
    }
    if (day == 2) {
      return "Tuesday"
    }
    if (day == 3) {
      return "Wednesday"
    }
    if (day == 4) {
      return "Thursday"
    }
    if (day == 5) {
      return "Friday"
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      optionType: options.type
    });
    if (options.type == 'edit') {
      this.getCourseInfo(options.courseId);
      this.setData({
        courseId: options.courseId
      });
    }
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
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '自定义转发标题',
      path: '/page/user?id=123'
    }
  }
})