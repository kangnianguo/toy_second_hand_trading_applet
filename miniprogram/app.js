//app.js
App({
  onLaunch: function () {
    this.globalData = {
      insertUser:this.insertUser
    }
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'toy-u7trt',
        traceUser: true,
      })
    }
    let openId = wx.getStorageSync("openId")
    let userInfo = wx.getStorageSync("userInfo")
    this.globalData.userInfo = wx.getStorageSync("userInfo")
    this.globalData.openId = wx.getStorageSync("openId")
  },
  insertUser(openId,userInfo){
    const db = wx.cloud.database();
    db.collection("users").where({
      _openid:openId,
    }).get({
      success(res){
        if (res.data.length == 0){
          db.collection("users").add({
            data: {
              userInfo: userInfo,
              isManager: false,
            }
          }).then(res => {
            console.log(res)
          })
        }
      },
      fail(err){
        console.log(err)
      }
    })
  }
})
