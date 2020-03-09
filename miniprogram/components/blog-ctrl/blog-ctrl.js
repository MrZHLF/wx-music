// components/blog-ctrl/blog-ctrl.js
let userInfo ={}
const db = wx.cloud.database()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId:String,
    blog:Object
  },
  externalClasses: ['iconfont', 'icon-pinglun', 'icon-fenxiang'],
  /**
   * 组件的初始数据
   */
  data: {
    loginShow:false, //是否授权
    modalShow:false, //底部弹出层
    content:"", //评论内容
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onComment() {
      //判断有用户是否授权
      wx.getSetting({
        success:(res) =>{
          if(res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success:(res)=> {
                userInfo = res.userInfo
                this.setData({
                  modalShow:true
                })
              }
            })
          } else {
            // 没有授权
            this.setData({
              loginShow:true
            })
          }
        }
      })
    },
    onLoginsuccess(){
      userInfo=event.detail
      // 授权之后,关闭授权按钮,显示评论输入框
      this.setData({
        loginShow: false
      },()=>{
        this.setData({
          modalShow: true
        })
      })
    },
    onLoginfail(){
      // 取消授权
      wx.showModal({
        title: '授权用户才能评价'
      })
    },
    onSend(event){
      //发布
      let formId = event.detail.formId
      let content = event.detail.value.content
      // 插入数据库
      if(content.trim() == '') {
        wx.showModal({
          title: '评价内容不能为空',
        })
        return
      }

      wx.showLoading({
        title: '评价中...',
        mask:true
      })
      db.collection('blog-comment').add({
        data:{
          content,
          createTime:db.serverDate(),
          blogId: this.properties.blogId,
          nickName:userInfo.nickName,
          avatarUrl:userInfo.avatarUrl
        }
      }).then((res) =>{
        //发送消息推送
        wx.cloud.callFunction({
          name:'sendMessage',
          data:{
            content,
            nickName: userInfo.nickName,
            formId,
            blogId:this.properties.blogId
          }
        }).then((res) =>{
          console.log(res)
        })

        wx.hideLoading()
        wx.showToast({
          title: '评论成功',
        })
        this.setData({
          modalShow:false,
          content:""
        })
        // 父元素刷新页面
        this.triggerEvent('refresnCommentList')
      })
    }
  }
})
