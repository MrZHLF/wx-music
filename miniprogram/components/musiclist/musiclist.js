// components/musiclist/musiclist.js
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    musiclist:{
      type:Array
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    playingId:-1
  },
  pageLifetimes:{
    show(){
      this.setData({
        playingId: parseInt(app.getPlayMusicId())
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onSelect(event){
      // 选中状态
      let musicid = event.currentTarget.dataset.musicid
      let index = event.currentTarget.dataset.index
      this.setData({
        playingId: musicid
      })
      wx.navigateTo({
        url: `/pages/player/player?musicId=${musicid}&index=${index}`,
      })
    }
  }
})
