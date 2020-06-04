// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db=cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  //获取玩具种类的index
  let index = event.typesIndex
  if(index == -1){
    //查询所有玩具
    let res = await db.collection("goods").get()
    return res
  }
  else{
    let res = await db.collection("goods").where({
      typesIndex:index.toString()
    }).get()
    return res
    
  }
}