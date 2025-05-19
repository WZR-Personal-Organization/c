<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'App',
  created() {
    // 网页加载时自动请求 config.json
    this.fetchConfig();
  },
  methods: {
    async fetchConfig() {
      try {
        const { data: config } = await axios.get('/config.json');
        this.$store.commit('updateConfig', config);
      } catch (error) {
        console.error('加载配置失败:', error);
      }
    }
  }
}
</script>

<style scoped>
#app { 
  width: 100%;
  height: 100%;
  border: none ;        /* 取消外边框 */
  }
</style>
  