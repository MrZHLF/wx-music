// pages/blog-edit/blog-edit.js
const MAX_WORDS_NUM =140
const MAX_IMG_NUM=9
const db = wx.cloud.database() //数据库
let userInfo = {} //用户信息
let content = ''//输入内容
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wordsNum:0,
    footerBottom:0, //键盘弹出
    images:[],
    selectPhoto:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    userInfo=options
  },
  onInput(event) {
    let wordsNum = event.detail.value.length
    if (wordsNum>=MAX_WORDS_NUM) {
      wordsNum = `最大数为${MAX_WORDS_NUM}`
    }
    this.setData({
      wordsNum
    })
    content = event.detail.value
  },
  onFocus(event) {
    // 获取焦点
    this.setData({
      footerBottom:event.detail.height
    })
  },
  onBlur(){
    // 失去焦点
    this.setData({
      footerBottom:0
    })
  },
  onChooseImage(){
    let max = MAX_IMG_NUM - this.data.images.length
    wx.chooseImage({
      count:max,
      ssizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success:(res) =>{
        this.setData({
          images: this.data.images.concat(res.tempFilePaths)
        })
        // 最多选几张照片
        // 还能再选几张图片
        max = MAX_IMG_NUM - this.data.images.length
        this.setData({
          selectPhoto: max <= 0 ? false : true
        })
      }
    })
  },
  onDelImage(event){
    // 删除
    let index = event.target.dataset.index;
    this.data.images.splice(index, 1)
    this.setData({
      images:this.data.images
    })
    if (this.data.images.length === MAX_IMG_NUM-1) {
      this.setData({
        selectPhoto:true
      })
    }
  },
  onPreviewImage(event){
    // 预览
    wx.previewImage({
      urls: this.data.images,
      current:event.target.dataset.images
    })
  },
  send(){
    // 发送
    if (content.trim() === '') {
      wx.showToast({
        title: '内容不能为空',
        icon:"none"
      })
      return
    }

    let promiseArr=[];
    let fileIds=[]; //图片地址
    // 图片上传云存储
    wx.showLoading({
      title: '发布中',
      mask:true
    })
    for(let i=0,len=this.data.images.length;i<len;i++) {
      let p = new Promise((resolve,rejrct) =>{
        let item = this.data.images[i]
        // 文件扩展名
        let suffix = /\.\w+$/.exec(item)[0]
        wx.cloud.uploadFile({
          cloudPath: 'blog/' + Date.now() + '-' + Math.random() * 1000000 + suffix,
          filePath: item,
          success: (res) => {
            //拿到图片地址
            fileIds = fileIds.concat(res.fileID)
            resolve()
          }, fail: (err) => {
            rejrct(err)
          }
        })
      })
      promiseArr.push(p)
    }
    // 存储数据库
    Promise.all(promiseArr).then((res) =>{
      db.collection('blog').add({
        data:{
          ...userInfo,
          content,
          img: fileIds,
          createTime: db.serverDate(), // 服务端的时间
        }
      }).then((res) =>{
        // 上传成功
        wx.hideLoading()
        wx.showToast({
          title: '发布成功',
        })
        // 返回blog页面
        wx.navigateBack()
        const pages = getCurrentPages()
        // 取到上一个页面
        const prevPage = pages[pages.length-2]
        prevPage.onPullDownRefresh() //调用山父组件刷新功能
      }).catch(err=>{
        // 上传失败
        wx.showToast({
          title: '发布失败',
        })
        wx.hideLoading()
      })
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})