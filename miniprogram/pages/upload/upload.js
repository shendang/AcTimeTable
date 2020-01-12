import Notify from '@vant/weapp/notify/notify';

const db = wx.cloud.database();
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showLoading: false
  },

   //上传图片至云存储
   uploadImg: function () {
    const openid = app.globalData.openid;
    let that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths;

        that.setData({
          showLoading: true
        })
        // 将图片上传至云存储空间
        wx.cloud.uploadFile({
          // 指定上传到的云路径
          cloudPath: `${openid}.png`,
          // 指定要上传的文件的小程序临时文件路径
          filePath: tempFilePaths[0],
          // 成功回调
          success: res => {
            //返回文件ID
            const fileID = res.fileID;
            //原计划先查询数据库中是否存在当前用户的图片信息，如果存在需要删除后再保存，确保一个用户只有一个图片信息
            //但是经测试发现，同一用户，上传名称相同的图片后，图片内容会覆盖，但是fileID不变，因此不需要删除原来的记录，只需要在无记录的情况下添加一条记录即可
            //仍旧保持数据库中针对同一用户只有一条图片记录
            db.collection('image').where({
              _openid: openid
            }).get().then(res => {
              console.log(res);
              if (res.data.length === 0) {
                  //保存图片信息到数据库
                  db.collection('image').add({
                    data: {
                      fileId: fileID
                    }
                  }).then(res => {
                    Notify({
                      type: 'success',
                      message: 'Upload Successfully!'
                    });
                    that.setData({
                      showLoading: false
                    });
                    setTimeout(() => {
                      wx.navigateBack();
                    }, 1000);
                  }).catch(err => {
                    Notify({
                      type: 'danger',
                      message: 'Sever Error, Please Contact WeChat mum8u6'
                    });
                    console.log(err);
                    that.setData({
                      showLoading: false
                    })
                  })
              }else{
                Notify({
                  type: 'success',
                  message: 'Upload Successfully!'
                });
                that.setData({
                  showLoading: false
                });
                setTimeout(() => {
                  wx.navigateBack();
                }, 1000);
              }
              
            }).catch(err => {
              console.log(err);
              Notify({
                type: 'danger',
                message: 'Sever Error, Please Contact WeChat mum8u6'
              });
              that.setData({
                showLoading: false
              })
            });
          },
          fail: err => {
            console.log(err);
            Notify({
              type: 'danger',
              message: 'Sever Error, Please Contact WeChat mum8u6'
            });
            that.setData({
              showLoading: false
            })
          }
        })
      }
    })
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