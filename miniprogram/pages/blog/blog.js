// pages/blog/blog.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalShow:false,
    blogList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._getBlogList()
  },
  _getBlogList(start=0){
    wx.showLoading({
      title: '数据加载中...',
    })
    wx.cloud.callFunction({
      name:"blog",
      data:{
        start,
        count: 10,
        $url:'list'
      }
    }).then((res) =>{
      console.log(res)
      this.setData({
        blogList:this.data.blogList.concat(res.result)
      })
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },
  onPublish(){
    // 判断用户是否授权
    wx.getSetting({
      success:(res)=>{
        console.log(res)
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success:(res)=> {
              console.log(res)
              this.onLoginSuccess({
                detail:res.userInfo
              })
            }
          })
        } else {
          // 没有授权
            this.setData({
              modalShow:true
          })
        }
      }
    })
  },
  onLoginSuccess(event){
    // 成功返回用户信息
    const detail = event.detail
    wx.navigateTo({
      url: `../blog-edit/blog-edit?nickName=${detail.nickName}&avatarUrl=${detail.avatarUrl}`,
    })
  },
  onLoginFail(){
    // 失败返回用户信息
    wx.showToast({
      title: '授权用户才能发布',
    })
  },
  goComment(event){
    wx.navigateTo({
      url: '../../pages/blog-comment/blog-comment?blogId=' + event.target.dataset.blogid,
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      blogList:[]
    })
    this._getBlogList(0)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this._getBlogList(this.data.blogList.length)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})