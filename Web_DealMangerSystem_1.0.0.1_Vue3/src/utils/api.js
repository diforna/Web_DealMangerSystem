import axios from 'axios' // 从axios库中引入axios，用于HTTP请求
import { useAuthStore } from '@/stores/auth' // 从stores/auth模块中引入useAuthStore函数，用于状态管理

/**
 * 创建一个axios实例，用于HTTP请求，并配置请求和响应拦截器以管理认证状态。
 * 主要功能包括：
 * - 创建axios实例，设置基础URL和超时时间。
 * - 请求拦截器：在每个请求中添加认证头（Authorization）。
 * - 响应拦截器：处理401未授权错误，清除认证信息并重定向到登录页面。
 */

// 创建axios实例，配置基础URL和超时时间
const api = axios.create({
  baseURL: '/api', // 设置基础URL为/api
  timeout: 10000 // 设置请求超时时间为10000毫秒（10秒）
})

// 请求拦截器，在每个请求中添加认证头
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore() // 获取认证状态的Pinia store实例
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}` // 在请求头中添加认证token
    }
    return config
  },
  (error) => {
    return Promise.reject(error) // 返回错误
  }
)

// 响应拦截器，处理响应和错误
api.interceptors.response.use(
  (response) => {
    return response.data // 返回响应数据
  },
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore() // 获取认证状态的Pinia store实例
      authStore.clearAuth() // 清除认证信息
      window.location.href = '/login' // 重定向到登录页面
    }
    return Promise.reject(error) // 返回错误
  }
)

// 导出axios实例
export default api
