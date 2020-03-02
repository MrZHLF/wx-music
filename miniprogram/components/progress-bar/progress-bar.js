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
    isSame:Boolean //从父组件接受过来传递判断是否当前播放是歌曲
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
      if (this.properties.isSame && this.data.showTime.totalTime == '00:00') {
        // 判断isSame是否位true和时间是否位当前设置的时间，重新调用更新时间的方法
        this._setTime()
      }
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
        isMoving=true
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
      isMoving=false
    },
    _getMovableDis(){
      //获取宽度
      const query = this.createSelectorQuery()
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec((rect) =>{
        movableAreaWidth = rect[0].width
        movableViewWidth=rect[1].width
      })
    },
    _bindBGMEvent() {
      
      backgroundAudioManager.onPlay(()=>{
        // 播放
        isMoving=false
        this.triggerEvent('musicPlay') //播放
      })
      backgroundAudioManager.onStop(() => {
        // 停止
      })
      backgroundAudioManager.onPause(() => {
        // 暂停
        this.triggerEvent('musicPause') //播放
      })
      backgroundAudioManager.onWaiting(() => {
        // 音频加载
      })
      backgroundAudioManager.onCanplay(() => {
        // 监听背景音频进入可播放状态事件。 但不保证后面可以流畅播放
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
        if (!isMoving){
          const currentTime = backgroundAudioManager.currentTime //当前播放进度时间
          const duration = backgroundAudioManager.duration //总时长

          const sec = currentTime.toString().split('.')[0]
          if (sec != currentSec) {
            // 判断时间是否有想等的 
            const currentFmt = this._dateFormat(currentTime)
            this.setData({
              movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
              progress: currentTime / duration * 100,
              ['showTime.currentTime']: `${currentFmt.min}:${currentFmt.sec}`
            })
            currentSec = sec
            // 联动歌词
            this.triggerEvent('timeUpdate',{
              currentTime
            })
          }
        }
      })
      backgroundAudioManager.onEnded(() => {
        // 监听播放完
        this.triggerEvent('musicEnd')
      })
      backgroundAudioManager.onError((res) => {
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
