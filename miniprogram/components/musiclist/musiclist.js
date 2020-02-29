// components/musiclist/musiclist.js
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

  /**
   * 组件的方法列表
   */
  methods: {
    onSelect(event){
      // 选中状态
      let musicid = event.currentTarget.dataset.musicid
      this.setData({
        playingId: musicid
      })
      wx.navigateTo({
        url: `/pages/player/player?musicid=${musicid}`,
      })
    }
  }
})
