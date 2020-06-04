//获取数据库实例
const db=wx.cloud.database()
Page({
  //页面数据
  data: {
    allToyList:[],    //所有玩具的列表
    toyList:[],    //玩具列表
    typeList:[],   //玩具种类
    curType:-1,   //当前选择的玩具种类
    isAll:true    //是否显示全部玩具
    
  },
  //页面加载时触发的生命周期函数
  onLoad: function () {
    //加载所有的玩具种类
    this.loadToyType()
    //加载所有的玩具列表
    this.loadToyList()
     
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

  //获取商品列表
  async loadToyList(){
    //查看当前选中的类型
    if(this.data.curType!=-1){
      this.setData({
        curType:-1,
      })
    }
    //显示加载框
    wx.showLoading({
      title: '加载中',
      mask:true   //设置遮罩层
    })
    //查询所有玩具
    let res=await db.collection("goods").get()
    const toyList=res.data
    //设置页面数据
    this.setData({
      toyList,
      allToyList:toyList,
      isAll:true,
    })
    //隐藏加载框
    wx.hideLoading()
  },
  selectType(e){
    //设置 当前页面的curType
    this.setData({
      isAll:false,
      curType:e.currentTarget.dataset.index
    })
    //显示选中的玩具种类的信息
    this.showToyType()

  },
  showToyType(){
    //获取所有玩具的列表
    const allToyList=this.data.allToyList
    let toyList =[]
    const len=allToyList.length
    for(let i=0;i<len;i++){
      //如果当前玩具的种类和选中的种类一致，则加入要显示的玩具列表
      if(allToyList[i].typesIndex==this.data.curType)
        toyList=toyList.concat(allToyList[i])
    }
    //设置页面要显示的玩具列表
    this.setData({
      toyList,
    })
    //如果没有要显示的玩具，就显示消息框
    if(toyList.length==0){
      wx.showToast({
        title: '无结果',
      })
    }

  },
  //跳转到详情页面
  toDetail(e){
    //获取到点击的商品详情
    const toyDetail=e.currentTarget.dataset.item
    //跳转到点击的商品详情页面
    wx.navigateTo({
      //传入商品信息 toyDetail
      url: `/pages/detail/detail?toyDetail=${JSON.stringify(toyDetail)}`,
    })
  }
})

