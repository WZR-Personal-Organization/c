import axios from 'axios';
import store from '@/store';

const service = axios.create();

// 请求拦截器：动态设置 baseURL（适配开发/生产环境）
service.interceptors.request.use(async (config) => {
  config.baseURL = '/api'; // 在代理中替换为实际url // 生产环境：与 Nginx 代理路径保持一致 // 开发环境：与 vue.config.js 代理路径保持一致
  return config;
});

export default service;