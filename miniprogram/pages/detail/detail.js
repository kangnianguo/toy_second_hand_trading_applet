const app=getApp()
//获取数据库实例
const db=wx.cloud.database()
let openId=""
Page({
  //页面数据
  data: {
    toyDetail:null,   // 玩具信息
    isCollected:false,    //是否收藏
  },
  //页面加载时会接受传来的商品信息
  onLoad: function (options) {
      //设置玩具信息
      this.setData({
        toyDetail: JSON.parse(options.toyDetail),
      })
      //获取 openId
      openId=app.globalData.openId
      //查询是否收藏
      this.isCollect()
  },
  //查询当前玩具是否已经收藏
  async isCollect(){
    //获取到当前玩具的信息
    const toyDetail=this.data.toyDetail
    //查询当前用户和当前玩具在收藏表中是否存在记录
    const res=await db.collection("collects").where({
      _openid:openId,
      goodId:toyDetail._id
    }).get()
    //如果存在记录则设为已收藏，否则未收藏
    this.setData({
      isCollected:res.data.length!=0?true:false,
    })
  },
  //收藏|取消收藏玩具
  async doCollect(){
    //获取到当前玩具的信息
    const toyDetail=this.data.toyDetail
    //获取到当前玩具的收藏状态
    const isCollected=this.data.isCollected
    //如果已收藏
    if(isCollected){
      //将查询到的记录移除
      await db.collection("collects").where({
        _openid:openId,
        goodId:toyDetail._id
      }).remove()
    }
    else{
      //往收藏表中添加一条记录
      await db.collection("collects").add({
        data:{
          goodDescript:toyDetail.goodDescript,
          goodId:toyDetail._id,
          goodName:toyDetail.goodName,
          storeInfo:toyDetail.storeInfo
        }
      })
    }
    this.setData({
      isCollected:!isCollected,
    })
  },
  //打电话
  callPhone(){
    //获取到当前玩具的信息
    const toyDetail=this.data.toyDetail
    wx.makePhoneCall({
      phoneNumber:toyDetail.storeInfo.storePhone
    })

  },
  //打开内置地图
  toAddress(){
    //获取到当前玩具的信息
    const toyDetail=this.data.toyDetail
    let {latitude,longitude,name,address} = toyDetail.storeInfo.address
    wx.openLocation({
      latitude,
      longitude,
      name,
      address,
      scale: 18,
    })
  },
  //跳转到投诉页面
  toReport(){
    wx.navigateTo({
      url: `/pages/report/report?id=${this.data.toyDetail._id}`,
    })
  }
})