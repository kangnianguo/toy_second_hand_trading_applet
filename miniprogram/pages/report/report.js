Page({
  data: {
    id:null,
    info:null,
    text:"",
    reqStatus:true,
    image:null
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id:options.id
    })
    this.initial()
  },

  upLoadImage() {
    let that = this;
    wx.chooseImage({
      count: 4,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        if (res.tempFiles[0].size > 1e6) {
          wx.showToast({
            title: "图片大于1m",
            icon: "none"
          })
        } else {
          var filePath = res.tempFilePaths[0]
          var fixFilePath = filePath.split("//").slice(1).join("")
          console.log(fixFilePath)
          // 上传图片
          const cloudPath = 'report/' + fixFilePath
          wx.showLoading({
            title: "正在上传图片中",
            mask: true
          });
          wx.cloud.uploadFile({
            cloudPath,
            filePath,
            success: res => {
              wx.showToast({
                icon: 'success',
                title: '上传图片成功',
              })
              that.setData({
                image: res.fileID
              })
            },
            fail: e => {
              wx.showToast({
                icon: 'none',
                title: '上传失败',
              })
            },
            complete: () => {
              wx.hideLoading()
            }
          })
        }
      }
    });
  },
  startReport(){
    let that = this;
    if (this.data.text == ""){
      wx.showToast({
        title:"内容不能为空",
        icon:"none"
      })
      return
    }
    wx.showModal({
      title: '提示',
      content: '是否投诉?',
      showCancel: true,
      cancelText: '取消',
      cancelColor: '#000000',
      confirmText: '确定',
      confirmColor: '#3CC51F',
      success: (result) => {
        if(result.confirm){
          if(that.data.reqStatus){
            that.setData({
              reqStatus:false
            })
            const db = wx.cloud.database()
            db.collection("reports").add({
              data: {
                goodId: that.data.id,
                reportText: that.data.text,
                goodName: that.data.info.goodName,
                goodDescript: that.data.info.goodDescript,
                typesName: that.data.info.typesName,
                imageUrl: that.data.info.imageUrl,
                reportUrl: that.data.image
              },
              success() {
                wx.showToast({
                  title: '投诉成功!',
                  icon: 'success',
                });
                that.setData({
                  reqStatus: true
                })
                setTimeout(()=>{

                },)
                wx.navigateBack({
                  delta: 1
                });
              }
            })
          }
        }
      }
    });
  },
  //设置举报内容
  setText(e){
    this.setData({
      text:e.detail.value
    })
  },
  async initial(){
    const db = wx.cloud.database()
    let res = await db.collection("goods").doc(this.data.id).get()
    this.setData({
      info:res.data
    })
  }
})