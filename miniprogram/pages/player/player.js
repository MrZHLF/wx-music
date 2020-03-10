// pages/player/player.js
let musiclist = []
// 正在播放歌曲的index
let nowPlayingIndex = 0
//获取全局位移背景音乐播放器
const backgroundAudioManager = wx.getBackgroundAudioManager()
const app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl:"",
    isPlaying:false, //false不播放，true播放
    isLyricShow:false ,//当前歌词是否显示
    lyric:"",
    isSame:false , //是否位同一首歌曲
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
    if (musicId == app.getPlayMusicId()){
      // 如果播放的是当前的歌曲 需要把isSame设置位true
      this.setData({
        isSame:true
      })
    } else {
     
      this.setData({
        isSame: false
      })
    }
    // 每次切换的时候先暂停
    if(!this.data.isSame) {
      // 不是瞳一首歌曲，暂停
      backgroundAudioManager.stop()
    }
    
    let music = musiclist[nowPlayingIndex]
    wx.setNavigationBarTitle({
      title:music.name,
    })
    this.setData({
      picUrl: music.al.picUrl,
      isPlaying:false
    })

    app.setPlayMusicId(musicId) //设置全局播放ID

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
      let result = JSON.parse(res.result)
      //设置全局背景音乐播放器
      if(result.data[0].url == null) {
        wx.showToast({
          title: '无权限播放',
        })
        return
      }
      if(!this.data.isSame) {
        // 如果不是同一首歌曲的话，设置播放属性，
        backgroundAudioManager.src = result.data[0].url
        backgroundAudioManager.title = music.name
        backgroundAudioManager.coverImgUrl = music.al.picUrl
        backgroundAudioManager.singer = music.ar[0].name
        backgroundAudioManager.epname = music.al.name

        // 保存播放历史记录
        this.savePlayHistory()
      }
      
      this.setData({
        isPlaying: true
      })
      wx.hideLoading()
      // 加载歌词
      wx.cloud.callFunction({
        name: 'music',
        data: {
          musicId,
          $url: 'lyric'
        }
      }).then((res) =>{
        
        let lyric='暂无歌词'
        const lrc = JSON.parse(res.result).lrc
        if(lrc) {
          lyric = lrc.lyric
          console.log(lrc)
        }
        this.setData({
          lyric
        })
      })
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
  onChangeLyriShow(){
    this.setData({
      isLyricShow: !this.data.isLyricShow
    })
  },
  timeUpdate(event){
    // 传给歌词组件
    this.selectComponent('.lyric').update(event.detail.currentTime)
  },
  onPlay(){
    // 播放  监听进度条传过来的方法 控制面板联动
    this.setData({
      isPlaying:true
    })
  },
  onPause(){
    // 暂停 监听进度条传过来的方法 控制面板联动
    this.setData({
      isPlaying: false
    })
  },
  // 保存播放历史
  savePlayHistory() {
    //  当前正在播放的歌曲
    const music = musiclist[nowPlayingIndex]
    const openid = app.globalData.openid
    const history = wx.getStorageSync(openid)
    let bHave = false
    for (let i = 0, len = history.length; i < len; i++) {
      if (history[i].id == music.id) {
        bHave = true
        break
      }
    }
    if (!bHave) {
      history.unshift(music)
      wx.setStorage({
        key: openid,
        data: history,
      })
    }
  },
})