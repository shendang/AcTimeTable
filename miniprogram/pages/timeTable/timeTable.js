import Notify from '@vant/weapp/notify/notify';
import Toast from '@vant/weapp/toast/toast';
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
    showMenu: false,
    // picAsHome: false,
    openTable: false,
    picFileID: "",
    dialogShow: false,
    openTableTitle:"",
    openTableProgram:"",
    openTableDesc:""
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
        this.ifOpenTable();
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
        message: 'Sever Error, Please Contact Customer Serveice'
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

  //公开课表switch 点击
  // openMyTableSwichOnClick:function({detail}){
  //   console.log(detail)
  //   let that =this;
  //   if(detail){
  //     wx.showLoading()
  //     wx.getSetting({
  //       success(res) {
  //         if (res.authSetting['scope.userInfo']) { //如果已授权
  //           wx.hideLoading()
  //           that.setData({
  //             dialogShow:true
  //           })
  //         }else{
  //           wx.hideLoading()
  //         }
  //       },
  //       fail(err){
  //         wx.hideLoading()
  //       }
  //     })
      
  //   }
  // },

  //公开课表
  openMyTable:function(){
    if(this.data.openTableTitle==undefined|| this.data.openTableTitle.trim()==''){
      Toast.fail("Title can't be empty");
      return;
    }
    if(this.data.openTableProgram==undefined||this.data.openTableProgram.trim()==''){
      Toast.fail("Program can't be empty");
      return;
    }
    if(this.data.openTableDesc==undefined||this.data.openTableDesc.trim()==''){
      Toast.fail("Description can't be empty");
      return;
    }
    if(this.data.openTableTitle.length>40){
      Toast.fail("Title no more than 40 characters");
      return;
    }
    if(this.data.openTableProgram.length>40){
      Toast.fail("Program no more than 40 characters");
      return;
    }
    if(this.data.openTableDesc.length>60){
      Toast.fail("Description no more than 40 characters");
      return;
    }
    db.collection('open_table').add({
      data:{
        title: this.data.openTableTitle,
        program: this.data.openTableProgram,
        desc: this.data.openTableDesc,
        nickName: app.globalData.nickName,
        avatarUrl: app.globalData.avatarUrl
    }}).then(res=>{
      this.setData({
        openTable : true
      });
      this.ifOpenTable();
      Notify({
        type: 'success',
        message: 'Thank you for openTable'
      });
    }).catch(err=>{
      Notify({
        type: 'danger',
        message: 'Sever Error, Please Contact Customer Serveice'
      });
    })
  },

  onGotUserInfo:function(e){
    if(e.detail.rawData!=undefined){
      let userInfo = JSON.parse(e.detail.rawData);
      app.globalData.nickName = userInfo.nickName;
      app.globalData.city = userInfo.city;
      app.globalData.country = userInfo.country;
      app.globalData.avatarUrl = userInfo.avatarUrl;
      app.globalData.gender = userInfo.gender;
      if(!this.data.openTable){//未openTable
        this.setData({
          dialogShow:true
        })
      }else{
        //关闭openTable
        this.closeOpenTable();
      }
      
    }
  },
  //点击pic as home按钮
  setPicHome({
    detail
  }) {
    console.log(detail);
    if (detail) {
      //将pic设置为home
      wx.showModal({
        title: 'Warning',
        content: 'Not recommend, continue？',
        cancelText: 'Cancel',
        confirmText: 'Confirm',
        success: res => {
          if (res.confirm) {
            wx.showLoading();
            db.collection('pic_home_user').add({
              data: {}
            }).then(res => {
              Notify({
                type: 'success',
                message: 'Successfuly setup'
              });
              this.ifPicAsHome();
              wx.hideLoading();
            }).catch(err => {
              Notify({
                type: 'danger',
                message: 'Sever Error, Please Contact Customer Serveice'
              });
              wx.hideLoading();
            })
          }
        }
      });
    } else {
      wx.showLoading();
      //取消将pic设置为home
      db.collection('pic_home_user').doc(this.data.picAsHomeId).remove().then(res => {
        Notify({
          type: 'success',
          message: 'Successfuly setup'
        });
        this.setData({
          picAsHome: false
        });
        wx.hideLoading();
      }).catch(err => {
        Notify({
          type: 'danger',
          message: 'Sever Error, Please Contact Customer Serveice'
        });
        wx.hideLoading();
      })
    }
  },

  //关闭openTable
  closeOpenTable:function(){
    wx.showLoading();
    db.collection('open_table').doc(this.data.openTableId).remove().then(res => {
      Notify({
        type: 'success',
        message: 'Close Open Table'
      });
      this.setData({
        openTable: false
      });
      wx.hideLoading();
    }).catch(err => {
      Notify({
        type: 'danger',
        message: 'Sever Error, Please Contact Customer Serveice'
      });
      wx.hideLoading();
    })
  },

  //判断用户是否openTable
  ifOpenTable: function(){
    db.collection('open_table').where({
      _openid: app.globalData.openid
    }).get().then(res=>{
      if(res.data.length>=1){
        this.setData({
          openTable : true,
          //暂存id用于删除该条数据
          openTableId:res.data[0]._id
        })
      }
    }).catch(err=>{
      console.log(err)
    })
  },

  //判断用户是否设置pic为home
  // ifPicAsHome: function () {
  //   db.collection('pic_home_user').get().then(res => {
  //     if (res.data.length === 1) {
  //       this.setData({
  //         picAsHome: true,
  //         //暂存id用于删除该条数据
  //         picAsHomeId: res.data[0]._id
  //       });
  //       this.getPicFileId();
  //     }
  //   }).catch(err => {
  //     console.log(err);
  //   })
  // },

  //获取当前用户上传的图片的fielID用于展示
  // getPicFileId:function(){
  //   db.collection('image').get().then(res=>{
  //   console.log(res.data[0].fileId);
  //     if(res.data.length>0){
  //       this.setData({
  //         picFileID:res.data[0].fileId
  //       });
  //     }
  //   }).catch(err=>{
  //     console.log(err);
  //   })
  // },
  editCourse: function () {
    wx.navigateTo({
      url: '../course/courseList',
    })
  },

  toUpload: function () {
    wx.navigateTo({
      url: '../upload/upload',
    })
  },

  shouwMap: function () {
    wx.navigateTo({
      url: '../map/map',
    })
  },
  toOpenTable: function () {
    wx.navigateTo({
      url: '../open/openList',
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
    this.setData({
      courseList: []
    });
    this.getOpenid();//包括获取课程信息 和是否openTable
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
    let nickName = app.globalData.nickName;
    console.log(nickName);
    let path = `/pages/share/share?shareOpenid=${app.globalData.openid}&from=share`;
    let title = 'Share My TimeTable';
    if(nickName!=undefined && nickName!= ""){
      path = `/pages/share/share?shareOpenid=${app.globalData.openid}&from=share&tableTitle=${nickName}`
      title = `${nickName}'s Table`
    }
    if (res.from === 'button') {
      this.setData({
        showMenu: false
      });
      return {
        title: title,
        path: path
      }
    } else {
      return {
        title: 'Ac TimeTable',
        path: `/pages/timeTable/timeTable`
      }
    }
  },
  openTableProgramBlur: function (event){
    this.setData({
      openTableTitle: event.detail.value
    })
  },

  onOpenTableTitleChange: function(event){
    this.setData({
      openTableTitle: event.detail
    })
  },
  openTableProgramBlur: function (event){
    this.setData({
      openTableProgram: event.detail.value
    })
  },

  openTableProgramChange: function(event){
    this.setData({
      openTableProgram: event.detail
    })
  },
  openTableDescBlur: function (event){
    this.setData({
      openTableDesc: event.detail.value
    })
  },

  openTableDescChange: function(event){
    this.setData({
      openTableDesc: event.detail
    })
  }
})