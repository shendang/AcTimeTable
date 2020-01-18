import Notify from '@vant/weapp/notify/notify';
import Toast from '@vant/weapp/toast/toast';

const db = wx.cloud.database();
const app = getApp();

// pages/open/openList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
    openTableList: [],
    searchValue: ""
  },

  onSearchChange: function (event) {
    this.setData({
      searchValue: event.detail
    });
  },

  onSearch() {
    this.getOpenTableListByPname()
  },

  onSearchClick() {
    this.getOpenTableListByPname()
  },

  //根据条件搜索
  getOpenTableListByPname: function () {
    if(this.data.searchValue===""){
      this.setData({
        openTableList:[]
      });
      this.getOpenTableList();
    }else{
      wx.showLoading()
      db.collection('open_table')
        .where({
          program: db.RegExp({
            regexp: '.*' + this.data.searchValue + '.*',
            options: 'i',
          })
        }).get()
        .then(res => {
          wx.hideLoading();
          if(res.data.length===0){
            Toast('No Match');
          }else{
            this.setData({
              openTableList: res.data
            })
          }
        })
        .catch(err=>{
          Notify({
            type: 'danger',
            message: 'Sever Error, Please Contact Customer Serveice'
          });
        })
    }
    
  },
  //获取openTableList
  getOpenTableList: function () {
    db.collection('open_table')
      .skip(this.data.openTableList.length)
      .limit(10)
      .get()
      .then(
        res => {
          console.log(res);
          this.setData({
            openTableList: this.data.openTableList.concat(res.data),
            loading: false
          });
        }
      ).catch(err => {
        Notify({
          type: 'danger',
          message: 'Sever Error, Please Contact Customer Serveice'
        });
      })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      openTableList: []
    })
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
      loading: true
    });
    this.getOpenTableList();
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
    wx.showLoading();
    db.collection('open_table')
      .skip(this.data.openTableList.length)
      .limit(10)
      .get()
      .then(res => {
        if (res.data.length === 0) {
          wx.hideLoading({
            complete: (res) => {
              Toast('No More');
            },
          })
        } else {
          wx.hideLoading();
          this.setData({
            openTableList: this.data.openTableList.concat(res.data)
          })
        }
      }).catch()
  },

  //查看openTable详情
  showOpenTableDetail: function (event) {
    wx.navigateTo({
      url: `../share/share?shareOpenid=${event.currentTarget.dataset.openid}&tableTitle=${event.currentTarget.dataset.title}&from=followList`
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})