import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  config: {
    securityJsCode_GD: '1', // 高德地图安全密钥
    key_GD: '2',  // 高德地图key
    mapCenterLongitude: 0 , // 地图默认中心点经度
    mapCenterLatitude: 0 , // 地图默认中心点纬度
    AmapMaxZoom: 16 , // 地图最大缩放等级
    videoAddr: "" , // 安全帽视频地址
  }
}

const mutations = {
  updateConfig(state, newConfig) {
    state.config = {
      securityJsCode_GD: newConfig.securityJsCode_GD,
      key_GD: newConfig.key_GD,
      mapCenterLongitude: newConfig.mapCenterLongitude,
      mapCenterLatitude: newConfig.mapCenterLatitude,
      AmapMaxZoom: newConfig.AmapMaxZoom,
      videoAddr: newConfig.videoAddr,
    }
  }
}

// 添加 getters（计算属性）
const getters = {
  // 获取 securityJsCode_GD
  getSecurityJsCode: (state) => state.config.securityJsCode_GD,
  // 获取 key_GD
  getKeyGD: (state) => state.config.key_GD,
  // 获取 MapCenterLongitude
  getMapCenterLongitude: (state) => state.config.mapCenterLongitude,
  // 获取 MapCenterLatitude
  getMapCenterLatitude: (state) => state.config.mapCenterLatitude,
  // 获取 AmapMaxZoom
  getAmapMaxZoom: (state) => state.config.AmapMaxZoom,
  // 获取 videoAddr
  getVideoAddr: (state) => state.config.videoAddr
}

export default new Vuex.Store({
  state,
  mutations,
  getters
})
  