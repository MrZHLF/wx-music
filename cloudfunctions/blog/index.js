// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')
cloud.init()

const db= cloud.database()
const blogCollection = db.collection('blog')
// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })

  const keyword=event.keyword;
  let w={}
  if(keyword.trim() != '') {
    w={
      content:db.RegExp({
        regexp:keyword,
        options:'i'
      })
    }
  }

  app.router('list',async(ctx,next) =>{
    // skip从第几页开始查 
    let blogList = await blogCollection.where(w).skip(event.start).limit(event.count).orderBy('createTime','desc').get().then((res) =>{
      return res.data
    })
    ctx.body = blogList
  })
  

  return app.serve()
}
