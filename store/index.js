import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    statusBarHeight: 0,
    menuButton: {
      width: 0,
      height: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    },
    safeMenuWidth: 0, 
    navContentHeight: 44,
    navBarTotalHeight: 0
  },
  mutations: {
    SET_SYSTEM_INFO(state, payload) {
      state.statusBarHeight = payload.statusBarHeight || 0
      state.menuButton = payload.menuButton || 0
      state.safeMenuWidth = state.menuButton?.width || 0
      state.navBarTotalHeight = state.statusBarHeight + state.navContentHeight
    }
  },
  actions: {
    initSystemInfo({ commit }) {
      const sys = uni.getSystemInfoSync()
      const rawMenu = uni.getMenuButtonBoundingClientRect()
      // H5 / App兜底，没有胶囊时赋完整默认对象
      const safeMenuObj = rawMenu && rawMenu.width
        ? rawMenu
        : { width:0, height:0, top:0, left:0, right:0, bottom:0 }

      commit('SET_SYSTEM_INFO', {
        statusBarHeight: sys.statusBarHeight || 0,
        menuButton: safeMenuObj
      })
    }
  }
})
