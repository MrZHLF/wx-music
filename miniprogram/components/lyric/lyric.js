// components/lyric/lyric.js
let lyricHeight=0
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isLyricShow:{
      type: Boolean,
      value:false
    },
    lyric:String
  },

  observers:{
    lyric(lrc) {
      if (lrc =='暂无歌词') {
        this.setData({
          lrcList:[
            {
              lrc,
              time:0
            }
          ],
          nowLyricIndex:-1
        })
      } else {
        this._parseLyric(lrc)
      }
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    lrcList:[],
    nowLyricIndex:0, //歌词高亮
    scrollTop:0, //歌词移动高度
  },

  lifetimes:{
    ready(){
      wx.getSystemInfo({
        success(res) {
          // 计算除1rpx的大下
          lyricHeight = res.screenWidth / 750 * 64
        },
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    update(currentTime){
      // 歌词高亮 从父组件拿到值
      let lrcList = this.data.lrcList
      if (lrcList.length == 0) {
        return
      }
      // 歌词滚动
      if (currentTime > lrcList[lrcList.length-1].time) {
        if(this.data.nowLyricIndex!=-1) {
          this.setData({
            nowLyricIndex:-1,
            scrollTop:lrcList.length * lyricHeight
          })
        }
      }

      for(let i=0,len=lrcList.length;i<len;i++) {
        if (currentTime <= lrcList[i].time) {
            this.setData({
              nowLyricIndex:i-1,
              scrollTop: (i - 1) * lyricHeight
            })
            break
        }
      }
    },
    // 解析歌词
    _parseLyric(sLyric) {
      let line = sLyric.split('\n')
      let _lrcList=[]
      line.forEach((elem) =>{
        let time = elem.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)
        if(time != null) {
          let lrc = elem.split(time)[1] //获取到歌词
          let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/) //获取到时间
          // 吧时间转换成秒
          let time2Senconds = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]) + parseInt(timeReg[3]) / 1000
          _lrcList.push({
            lrc,
            time: time2Senconds
          })
        }
      })
      this.setData({
        lrcList: _lrcList
      })
    }
  }
})
