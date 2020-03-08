// components/search/search.js
let keyword=""
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    placeholder:{
      type:String,
      value:"请输入"
    }
  },
  externalClasses: [
    'iconfont',
    'icon-sousuo',
  ],
  /**
   * 组件的初始数据
   */
  data: {
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onInput(event){
      keyword=event.detail.value
    },
    onSearch(){
      console.log(keyword)
      this.triggerEvent('search', { keyword})
    }
  }
})
