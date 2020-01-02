// pages/follow/followList.js
import Toast from 'vant-weapp/toast/toast';
import Dialog from 'vant-weapp/dialog/dialog';
const db = wx.cloud.database();
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    followList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    this.setData({
      followList: []
    });
    this.getFollowList();
  },

  //获取关注列表
  getFollowList:function(){
    wx.showLoading({});
    db.collection('follow_relation').get().then(res=>{
      if (res.data.length === 0) {
        wx.hideLoading({
          complete: (res) => {
            Toast('No Following');
          },
        })
        
      }else{
        wx.hideLoading();  
        this.setData({
          followList: this.data.followList.concat(res.data)
        });
      }
    }).catch(err=>{
      wx.hideLoading();
      Toast('Error, Plz contanct wechat mum8u6');
    })
  },

  //查看课表
  viewTable:function(event){
    console.log(event);
    wx.navigateTo({
      url: `../share/share?shareOpenid=${event.target.dataset.followedopenid}&tableTitle=${event.target.dataset.title}`
    });
  },

   //取关确认
   unFollowConfirm: function(event) {
    let id = event.target.dataset.id;
    Dialog.confirm({
      title: 'Confirm',
      message: 'Unfollow?',
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel'
    }).then(() => {
      // on confirm
      this.unFollow(id);
    }).catch(() => {
    });
  },

  //取关
  unFollow:function(id){
    wx.showLoading({
      title: 'UnFollowing',
    })
    db.collection('follow_relation')
      .doc(id)
      .remove()
      .then(res => {
        wx.hideLoading();
        Toast.success('UnFollowed');
        this.setData({
          followList: []
        });
        this.getFollowList();

      }).catch(err => {
        Toast('Error, Plz contanct wechat mum8u6');
      })
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

  }
})