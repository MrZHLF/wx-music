// pages/player/player.js
let musiclist = []
// 正在播放歌曲的index
let nowPlayingIndex = 0
//获取全局位移背景音乐播放器
const backgroundAudioManager = wx.getBackgroundAudioManager()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl:"",
    isPlaying:false, //false不播放，true播放
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    nowPlayingIndex = options.index
    musiclist = wx.getStorageSync('musiclist')
    this._loadMusicDetail(options.musicId)
  },
  _loadMusicDetail(musicId) {
    // 每次切换的时候先暂停
    backgroundAudioManager.stop()
    let music = musiclist[nowPlayingIndex]
    console.log(music)
    wx.setNavigationBarTitle({
      title:music.name,
    })
    this.setData({
      picUrl: music.al.picUrl,
      isPlaying:false
    })
    wx.showLoading({
      title: '歌曲加载中...',
    })
    wx.cloud.callFunction({
      name:'music',
      data:{
        musicId,
        $url:'musicUrl'
        
      }
    }).then((res)=>{
      console.log(res,'res')
      let result = JSON.parse(res.result)
      //设置全局背景音乐播放器
      backgroundAudioManager.src = result.data[0].url
      backgroundAudioManager.title = music.name
      backgroundAudioManager.coverImgUrl=music.al.picUrl
      backgroundAudioManager.singer=music.ar[0].name 
      backgroundAudioManager.epname=music.al.name
      this.setData({
        isPlaying: true
      })
      wx.hideLoading()
    })
  },
  togglePlaying(){
    // 播放事件
    if(this.data.isPlaying) {
      //正在播放,点击暂停
      backgroundAudioManager.pause()
    } else {
      // 点击播放
      backgroundAudioManager.play()
    }
    this.setData({
      isPlaying: !this.data.isPlaying
    })
  },
  onPrev(){
    // 上一首
    nowPlayingIndex--
    if(nowPlayingIndex<0) {
      // 播放最后一个
      nowPlayingIndex=musiclist.length -1
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  onNext(){
    // 下一首
    nowPlayingIndex++
    if(nowPlayingIndex===musiclist.length) {
      // 如果切换了最后一首之后，在切换，返回第一个
      nowPlayingIndex=0
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
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