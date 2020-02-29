// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db= cloud.database() //初始化

const rp = require('request-promise')
const URL= 'http://musicapi.xiecheng.live/personalized'

const MAX_LIMIT=100

// 云函数入口函数
const playlistCollection = db.collection('playlist') //数据集合

exports.main = async (event, context) => {
  //const list = await playlistCollection.get() //或者集合里面所有数据

  const countResult = await playlistCollection.count() //数据数量
  const total = countResult.total //数据总条数
  const batchTimnes = Math.ceil(total/MAX_LIMIT)
  const tasks=[]
  for(let i=0;i<batchTimnes;i++){
    let promise = playlistCollection.skip(i*MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  let list = {
    data:[]
  }
  if(tasks.length >0) {
   list =  (await Promise.all(tasks)).reduce((acc,cur) =>{
      return {
        data:acc.data.concat(cur.data)
      }
    })
  }
  // 服务器端数据
  const playlist = await rp(URL).then((res) =>{
    return JSON.parse(res).result
  })
  
  // 去重 防止添加相同数据
  const newData = []
  for (let i = 0, len1 = playlist.length; i < len1; i++) {
    let flag = true
    for (let j = 0, len2 = list.data.length; j < len2; j++) {
      if (playlist[i].id === list.data[j].id) {
        flag = false
        break
      }
    }
    if (flag) {
      newData.push(playlist[i])
    }
  }

  // 插入云数据库
  for (let i = 0, len = newData.length; i < len; i++) {
    await playlistCollection.add({
      data:{
        ...newData[i],
        createTime:db.serverDate()
      }
    }).then(res=>{
      console.log('成功')
    }).catch((err) =>{
      console.log('失败')
    })
  }
  return newData.length
}