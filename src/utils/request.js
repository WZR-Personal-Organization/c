import axios from 'axios';
import store from '@/store';

const service = axios.create();

// 使用方法
// Map.vue
// import service from '@/utils/request';
// const response = await service.get(url);
// const response = await service.post(url, data);

// 请求拦截器：动态设置 baseURL（适配开发/生产环境） // baseURL会拼在调用时提供的url前面
service.interceptors.request.use(async (config) => {
  config.baseURL = '/api'; // 在代理中替换为实际url // 生产环境：与 Nginx 代理路径保持一致 // 开发环境：与 vue.config.js 代理路径保持一致
  return config;
});

export default service;