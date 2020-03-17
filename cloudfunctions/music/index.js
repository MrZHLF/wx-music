// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')
const rp = require('request-promise')
cloud.init()

const BASE_URL = 'http://musicapi.xiecheng.live'
// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({event})
  app.router('playlist',async(ctx,next) =>{
    ctx.body = await cloud.database().collection('')
      .skip(event.start)
      .limit(event.count)
      .orderBy('createTime', 'desc')
      .get()
      .then((res) => {
        return res
      })
  })

  // 歌曲详情
  app.router('musiclist',async(ctx,next) =>{
    ctx.body = await rp(BASE_URL + '/playlist/detail?id=' + parseInt(event.playlistId)).then((res) =>{
      return JSON.parse(res)
    })
  })

  // 播放歌曲
  app.router('musicUrl',async(ctx,next) =>{
    ctx.body = await rp(BASE_URL+ `/song/url?id=${event.musicId}`).then((res) =>{
      return res
    })
  })
  // 歌词
  app.router('lyric', async (ctx, next) => {
    ctx.body = await rp(BASE_URL + `/lyric?id=${event.musicId}`).then((res) => {
      return res
    })
  })




  return app.serve()
}