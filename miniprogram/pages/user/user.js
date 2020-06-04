var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl:null,
    userInfo:null,
    isManager:false,
    reports:[],
    collects:[]
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    wx.showTabBar({
      animation: false,
    });
    this.initial()
  },

  initial(){
    let that = this;
    if (app.globalData.hasOwnProperty("userInfo")) {
      let { userInfo } = app.globalData;
      this.setData({
        userInfo: userInfo,
        avatarUrl: userInfo.avatarUrl
      })
    }
    const db = wx.cloud.database();
    if (app.globalData.hasOwnProperty("openId")) {
      db.collection("users").where({
        _openid: app.globalData.openId,
      }).get({
        success(res) {
          that.setData({
            isManager: res.data[0].isManager
          })
          if (res.data[0].isManager) {
            that.getReport()
          }
        }
      })
      that.getCollect()
    }
  },
  //获取举报列表
  getCollect(){
    let that = this;
    const db = wx.cloud.database();
    db.collection("collects").where({
      _openid: app.globalData.openId,
    }).get({
      success(res) {
        that.setData({
          collects: res.data
        })
      }
    })
  },
  //获取收藏列表
  getReport(){
    let that = this;
    const db = wx.cloud.database();
    db.collection("reports").get({
      success(res) {
        that.setData({
          reports: res.data
        })
      }
    })
  },
  getuserInfo(e) {
    if (e.detail.userInfo) {
      this.setData({
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
      app.globalData.userInfo = e.detail.userInfo
      wx.setStorageSync("userInfo", e.detail.userInfo)
    }
    //触发发布页面的事件，检查当前页面是否有店铺信息

  },
  onGetOpenid: function () {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openId = res.result.openid
        wx.setStorageSync("openId", res.result.openid)
        app.insertUser(res.result.openid,this.data.userInfo)
        this.initial()
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },
  toDetail(e){
    let {id} = e.currentTarget.dataset;
    wx.navigateTo({
      url:`/pages/detail/detail?id=${id}`
    })
  },
  // 预览图片
  preImage(e) {
    wx.previewImage({
      current: 1,
      urls: [e.currentTarget.dataset.url]
    })
  },
})