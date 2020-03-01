// components/progress-bar/progress-bar.js
let movableAreaWidth = 0
let movableViewWidth = 0
const backgroundAudioManager = wx.getBackgroundAudioManager() //全局背景音乐
let currentSec = -1 // 当前的秒数
let duration = 0 // 当前歌曲的总时长，以秒为单位
let isMoving = false // 表示当前进度条是否在拖拽，解决：当进度条拖动时候和updatetime事件有冲突的问题

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime:{
      currentTime:"00:00",
      totalTime: "00:00"
    },
    movableDis:0,
    progress:0, //进度
  },
  lifetimes:{
    ready(){
      this._getMovableDis()
      this._bindBGMEvent()
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onChange(event){
      // 移动
      if(event.detail.source=='touch') {
        this.data.progress=event.detail.x / (movableAreaWidth-movableViewWidth) * 100
        this.data.movableDis =event.detail.x
      }
    },
    onTouchEnd(){
      // 松开
      const currentTimeFmt = this._dateFormat(Math.floor(backgroundAudioManager.currentTime))
      this.setData({
        progress:this.data.progress,
        movableDis:this.data.movableDis,
        ['showTime.currentTime']: currentTimeFmt.min + ':' + currentTimeFmt.sec
      })
      backgroundAudioManager.seek(duration*this.data.progress / 100)
    },
    _getMovableDis(){
      const query = this.createSelectorQuery()
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec((rect) =>{
        console.log(rect)
        movableAreaWidth = rect[0].width
        movableViewWidth=rect[1].width
      })
    },
    _bindBGMEvent() {
      
      backgroundAudioManager.onPlay(()=>{
        // 播放
        console.log('onPlay')
      })
      backgroundAudioManager.onStop(() => {
        // 停止
        console.log('onStop')
      })
      backgroundAudioManager.onPause(() => {
        // 暂停
        console.log('onPause')
      })
      backgroundAudioManager.onWaiting(() => {
        // 音频加载
        console.log('onWaiting')
      })
      backgroundAudioManager.onCanplay(() => {
        console.log(backgroundAudioManager.duration,'onCanplay')
        if (typeof backgroundAudioManager.duration != 'undefined') {
          //获取音频总时间
          this._setTime()
        } else {
          setTimeout(()=>{
            this._setTime()
          },1000)
        }
      })
      backgroundAudioManager.onTimeUpdate(() => {
        
        const currentTime = backgroundAudioManager.currentTime //当前播放进度时间
        const duration = backgroundAudioManager.duration //总时长
      
        const sec = currentTime.toString().split('.')[0]
        if (sec != currentSec) {
          // 判断时间是否有想等的 
          const currentFmt = this._dateFormat(currentTime)
          console.log('onTimeUpdate', currentTime)
          this.setData({
            movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
            progress: currentTime / duration * 100,
            ['showTime.currentTime']: `${currentFmt.min}:${currentFmt.sec}`
          })
          currentSec=sec
        }
        
      })
      backgroundAudioManager.onEnded(() => {
        // 监听播放完
        console.log('onEnded')
      })
      backgroundAudioManager.onError((res) => {
        console.log(res.errMsg)
        wx.showToast({
          title: '错误'+res.errMsg,
        })
      })
    },
    _setTime(){
      //算播放总时长
      duration= backgroundAudioManager.duration //获取播放总时长
      const durationFmt=this._dateFormat(duration)
      this.setData({
        ['showTime.totalTime']: `${durationFmt.min}:${durationFmt.sec}`
      })
    },
    _dateFormat(sec){
      //格式化时间
      const min = Math.floor(sec/60) //分钟
      sec = Math.floor(sec % 60) //秒
      return {
        'min': this._parse0(min),
        'sec': this._parse0(sec)
      }
    },
    _parse0(sec) {
      // 补0
      return sec < 10 ? '0' + sec : sec
    }
  }
})
