module.exports = {
    devServer: {
      proxy: {
        // 匹配所有以 /api 开头的请求
        '/api': {
          target: 'http://192.168.1.27:8091', // 后端实际地址
          changeOrigin: true, // 开启跨域代理
          pathRewrite: {
            '^/api': '' // 路径重写：前端请求 /api/xxx 会被转发到 http://192.168.1.27:8091/xxx
          }
        }
      }
    }
  };