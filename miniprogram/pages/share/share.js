
import Toast from '@vant/weapp/toast/toast';

const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dialogShow:false,
    courseList: [],
    shareOpenid:"",
    currentOpenid:"",
    tableTitle:"Other's Share",
    time: ["8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00",
      "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00",
      "22:00"],
    weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri"]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    this.setData({
      shareOpenid: options.shareOpenid,
      from:options.from
    });
    //判断展示home按钮还是返回按钮,从关注列表进入，展示返回，从别人分享进入，显示home
    if(options.from == 'share'){
      this.setData({
        showHomeButn : true
      });
    }else{
      this.setData({
        showHomeButn : false
      });
    }
    console.log(this.data.showHomeButn);
    //已关注展示红心，未关注展示空心
    if(this.ifHasFollowed()){
      this.setData({
        hasFollowed : true
      });
    }else{
      this.setData({
        hasFollowed : false
      });
    }
    if(options.tableTitle!=undefined){
      this.setData({
        tableTitle: options.tableTitle
      });
    }
    wx.showLoading({
    });
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid);
       
        this.setData({
          currentOpenid: res.result.openid
        });


        this.getUserCourseInfo(options.shareOpenid);
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
   
  },

  //返回上一页面
  goBack:function(){
    wx.navigateBack()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
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
  onShareAppMessage: function () {
  
  },


  // 获取分享人的课程信息
  getUserCourseInfo: function (openid) {
    wx.showLoading({
    });
    if(openid ==""|| openid== undefined){
      wx.hideLoading();
      Toast('No Course');
      return;
    }
    db.collection('course').where({
      _openid: openid
    }).get().then(res => {
      if (res.data.length === 0) {
        Toast('No Course');
      }
      this.setData({
        courseList: this.data.courseList.concat(res.data)
      });
      wx.hideLoading();
    }).catch(err => {
      Toast('Sever Error, Please Contact Customer Serveice');
      wx.hideLoading();
    })
  },

  //跳转到主页
  goAppHome: function(){
    wx.navigateTo({
      url: '../timeTable/timeTable',
    })
  },

  //展示follow对话框
  showFollowDialog: function(){
    this.setData({
      dialogShow:true
    })
  },

  //关注
  follow:function(){
    if(this.data.shareOpenid === undefined || this.data.shareOpenid === ''){
      Toast('Error, Plz contanct wechat mum8u6');
      return;
    }
    if(this.hasFollowed){
      Toast.fail('Has Followed');
      return;
    }
    if(this.data.shareOpenid==''||this.data.shareOpenid==undefined){
      Toast.fail("Title can't be empty");
      return;
    }
    this.setData({
      hasFollowed: true
    });
    let followRelation ={
      title : this.data.tableTitle,
      followedOpenid : this.data.shareOpenid
    }
    db.collection('follow_relation').add({
      data:followRelation
    }).then(()=>{
      Toast.success('Followed');
      this.ifHasFollowed();
    }).catch(err=>{
      console.log(err);
      Toast('Follow Failed,Plz contanct Customer Serveice');
      this.setData({
        hasFollowed: false
      });
    })
  },
  //取消关注
  unFollow: function () {
    this.setData({
      hasFollowed: false
    });
    db.collection('follow_relation').doc(this.data.relationId).remove().then(res=>{
      Toast.success('Unfollowed');
    }).catch(err=>{
      this.setData({
        hasFollowed: true
      });
      Toast('Unfollowed Failed,Plz contanct Customer Serveice');
    });
  },

  //判断是否已关注当前课表
  ifHasFollowed:function(){
    db.collection('follow_relation').where({
      followedOpenid : this.data.shareOpenid
    }).get().then(res=>{
      console.log(res);
      if (res.data.length === 1) {
        this.setData({
          hasFollowed : true,
          relationId: res.data[0]._id,
          tableTitle: res.data[0].title
        });
        return true;   
      }else{
        return false;
      }
    })
  },
  ontableTitleBlur: function (event){
    this.setData({
      tableTitle: event.detail.value
    })
  },

  ontableTitleChange: function(event){
    this.setData({
      tableTitle: event.detail
    })
  }
})