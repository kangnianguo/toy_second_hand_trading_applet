
var app = getApp();
//获取数据库的实例
const db=wx.cloud.database()
let userInfo=null
let url=null
let openId=null
Page({
  data:{
    isAuthorized:false,   //当前用户是否授权
    haveStoreMessage:false,   //是否录入店铺信息
    storeMessage:["店铺名","真实姓名","店铺电话","身份证"],
    enStoreMessage:["storeName","userRealName","storePhone","idCard"],
    toyInfo:{
      storeName:"",
      userRealName:"",
      storePhone:"",
      idCard:"",
      adress:"",
      name:"",
      goodDescript:"",
      imageUrl:"",
      videoUrl:"",
    },   //玩具和店铺信息
    typeList:[],   //玩具种类
    chooseTypeIndex:0,    //选中的玩具种类
  },

  //页面加载时自动调用的函数
  onLoad: function (options) {
    // console.log("onLoad"+app.globalData.userInfo)
    //获取所有玩具种类
    this.loadToyType()
    //检查当前用户是否授权

    
    
    wx.getSetting({
      success:(res)=>{
        //获取到授权信息
        if(res.authSetting['scope.userInfo']){
          //获取用户信息（微信昵称，头像等）
          wx.getUserInfo({
            success:(res)=>{
              //获取到用户信息
              userInfo=res.userInfo
              //获取openId，然后检查是否有店铺信息
              wx.cloud.callFunction({
                name:"login",
                success:(res)=>{
                  //获取到openId
                  openId=res.result.event.userInfo.openId
                  //检查当前用户是否含有店铺信息
                  this.hasStoreMessage()
                }
              })
              this.setData({
                isAuthorized:true,
              })

            }
          })
         
        }
      }
    })
   
  },
  onShow:function(){
    console.log(this.data.isAuthorized)
    let that = this;
    if (app.globalData.hasOwnProperty("userInfo")) {
      let { userInfo } = app.globalData;
      this.setData({
        isAuthorized:true,
      })
    }
    console.log(this.data.isAuthorized)
  },
  //从users表中查询用户的店铺信息
  async hasStoreMessage(){
    //根据当前用户的openid查询users表里面的店铺填写状态信息 fillStatus
    const result=await db.collection("users").where({
      _openid: openId
    }).get()
    if (result.data.length > 0){
      if (result.data[0].fillStatus){
          this.setData({
            haveStoreMessage:true,
          })
      }
    }
  },
  //设置输入
  setInput(event){
    let value=event.detail.value    //获取到事件属性的值
    //获取到事件的具体属性
    let field = event.currentTarget.dataset.type;
    //要修改的页面数据 用.访问自己的属性
    let name="toyInfo."+field
    this.setData({
      [name]:value,
    })
  
  },
  //加载所有玩具种类列表
  async loadToyType(){
    //查询types集合中的数据
    let res=await db.collection("type").get()
    const typeList=res.data
    //设置页面的typeList
    this.setData({
      typeList
    })
  },
  
  async upLoadFile(filePath,type){
    //设置一个云端的路径,通过split传入的字符进行分割，取到//后面的所有字符
    let cloudPath="image/"+filePath.split("//").slice(1,)
    //调用上传文件的接口
    await wx.cloud.uploadFile({
      cloudPath,    //云端的路径
      filePath,   //文件路径
      //如果上传成功，则显示成功的消息框
      success: res => {
        wx.showToast({
          icon: 'success',
          title: '上传成功',
        })
        //如果上传的是图片
        if(type=="image"){
          let imageUrl="toyInfo.imageUrl"
          this.setData({
            [imageUrl]:res.fileID,
          })
        }
        //如果上传的是视频
        else if(type=="video"){
          let videoUrl="toyInfo.videoUrl"
          this.setData({
            [videoUrl]:res.fileID,
          })
        }
      },
      fail: e => {
        wx.showToast({
          icon: 'none',
          title: '上传失败',
        })
        
      },
    })
  },
  //上传图片
  async upLoadImage(){
    await wx.chooseImage({
      count: 1,   //最多上传一张图片
      sizeType: ['compressed'],
      sourceType: ['album','camera'],
      success:(res)=>{
        //显示加载框
        wx.showLoading({
          title: '图片正在上传',
          mask:true,
        })
        //获取文件路径
        let filePath=res.tempFilePaths[0]
        //调用upLoadFile函数将图片上传到云储存
        this.upLoadFile(filePath,"image")
        //隐藏加载框
        wx.hideLoading()
      }
    })
  },
  //上传视频
  async upLoadVideo(){
    await wx.chooseVideo({
      sourceType:['album', 'camera'],   //文件类型
      compressed: true,   //是否压缩
      maxDuration:15,   //视频限制时长
      success:(res)=>{
        //显示加载框
        wx.showLoading({
          title: '视频正在上传',
          mask:true,
        })
        //获取文件路径
        let filePath=res.tempFilePath
        //调用upLoadFile函数将视频上传到云储存
        this.upLoadFile(filePath,"video")
        //隐藏加载框
        wx.hideLoading()
      }
    })
  },
  //选择的玩具种类
  chooseType(event){
    let typesIndex="toyInfo.typesIndex"
    this.setData({
      [typesIndex]:event.detail.value,
      chooseTypeIndex:event.detail.value,
    })
  },
  //添加店铺和商品信息到云端数据库
  postMessage(){
    //检查必填项的信息
    //toyInfo 表示店铺信息和玩post具信息
    const toyInfo=this.data.toyInfo
    if(!this.data.haveStoreMessage){
      if (toyInfo.storeName == ""){
        this.getWarning("请输入店铺名")
        return
      } 
      else if (toyInfo.userRealName == "") {
        this.getWarning("请输入真实姓名")
        return
      }
      else if (toyInfo.storePhone == ""){
        this.getWarning("请输入店铺电话")
        return
      } 
      else if (toyInfo.idCard==""){
        this.getWarning("请输入身份证号")
        return
      }
      else if (toyInfo.address == null){
        this.getWarning("请输入店铺地址")
        return
      }
    }
    if(toyInfo.name==null){
      this.getWarning("请输入玩具名称")
      return
    }
    else if(toyInfo.goodDescript==null){
      this.getWarning("请输入玩具描述")
      return
    }
    else if(toyInfo.imageUrl==""){
      this.getWarning("请上传图片")
      return
    }
    else if(toyInfo.videoUrl==""){
      this.getWarning("请上传视频")
      return
    }
    //校验手机号和身份证是否正确
    //手机号的正则表达式
    let telStr = /^[1](([3][0-9])|([4][5-9])|([5][0-3,5-9])|([6][5,6,7])|([7][0-8])|([8][0-9])|([9][1,8,9]))[0-9]{8}$/;
    //身份证号的正则表达式
    let idStr = /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}$)/;
    if(!telStr.test(toyInfo.storePhone)){
      this.getWarning("店铺电话格式不正确")
      return
    }
    else if(!idStr.test(toyInfo.idCard)){
      this.getWarning("身份证号格式不正确")
      return
    }

    //更新用户信息
    this.updataUserInfo()
    //清除当前页面的所有数据
    this.setData({
      toyInfo:null,
    })
  },
  //更新用户信息
  async updataUserInfo(){
    let {storeName,storePhone,address,storeUserName,storeIdCard}=this.data.toyInfo
    //如果没有店铺信息，就添加用户的身份和店铺信息
    if(!this.data.haveStoreMessage){
      await db.collection("users").add({
        data:{
          userInfo,
          fillStatus:true,
          fillData:{
            storeName,
            storePhone,
            address,
            storeUserName,
            storeIdCard
          }
        },
      })
      //更新页面的数据
      this.setData({
        haveStoreMessage:true,
      })
    }
  },
  //显示消息提示框
  getWarning(title){
    wx.showToast({
      title,
      icon: 'none',
    })
  },
  //跳转到首页
  toIndex(){
    wx.switchTab({
      url:"/pages/index/index"
    })
    //清空当前页面的所有数据
    this.setData({
      toyInfo:null,
    })

  },
  //选择地址
  chooseAddress(){
    wx.chooseLocation({
      complete: (res) => {
        let address="toyInfo.address"
        this.setData({
          [address]:{
            address:res.address,
            latitude:res.latitude,
            longitude:res.longitude,
            name:res.name
          }
        })
      },
    })
  },
  onGetUserInfo(event){
    userInfo=event.detail.userInfo
    this.setData({
      isAuthorized:true,
    })
    app.globalData.userInfo = event.detail.userInfo
    wx.setStorageSync("userInfo", event.detail.userInfo)
  }
})