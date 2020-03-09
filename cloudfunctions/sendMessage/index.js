// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const {
    OPENID
  } = cloud.getWXContext()

  const result = await cloud.openapi.templateMessage.send({
    touser: OPENID,
    page: `/pages/blog-comment/blog-comment?blogId=${event.blogId}`,
    data: {
      thing4: {
        value: event.content
      },
      thing3: {
        value: event.nickName
      }
    },
    templateId: 'cq8n3i9UnjHj8HR50lJKBWUMHEDxa5F8Xxbc_7fypNM', //订阅消息模板ID
    formId: event.formId
  })
  console.log(result)
  return result
}