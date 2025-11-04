import { defineStore } from 'pinia' // 从pinia库中引入defineStore函数，用于定义store
import { ref, computed } from 'vue'  // 从vue库中引入ref和computed函数，用于创建响应式数据和计算属性

/**
 * 定义名为 'auth' 的 Pinia store，用于管理应用的认证状态和用户信息。
 * 主要功能包括：
 * - 初始化认证状态和用户信息，从 localStorage 中获取。
 * - 提供 setAuth 函数来设置新的认证信息，并保存到 localStorage。
 * - 提供 clearAuth 函数来清除认证信息，并从 localStorage 中移除。
 * - 提供 isAuthenticated 计算属性来判断用户是否已认证。
 * - 提供 isAdmin 计算属性来判断用户是否是管理员。
 * - 返回所有定义的响应式数据和方法，以便在组件中使用。
 */

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '') // 使用ref创建一个响应式变量token，初始值从localStorage中获取，如果没有则为空字符串
  const user = ref(JSON.parse(localStorage.getItem('user') || '{}')) // 使用ref创建一个响应式变量user，初始值从localStorage中获取，如果没有则为空对象

  const setAuth = (newToken, userData) => {
    token.value = newToken // 更新token的值
    user.value = userData // 更新user的值
    localStorage.setItem('token', newToken) // 将新的token保存到localStorage
    localStorage.setItem('user', JSON.stringify(userData)) // 将用户数据保存到localStorage
  }

  const clearAuth = () => {
    token.value = '' // 清空token的值
    user.value = {} // 清空user的值
    localStorage.removeItem('token') // 从localStorage中移除token
    localStorage.removeItem('user') // 从localStorage中移除用户数据
  }

  const isAuthenticated = computed(() => !!token.value) // 计算属性，用于判断用户是否已认证
  const isAdmin = computed(() => user.value.role === 'admin') // 计算属性，用于判断用户是否是管理员

  return {
    token, // 当前认证的token
    user, // 当前用户的信息
    setAuth, // 设置认证信息的函数
    clearAuth, // 清除认证信息的函数
    isAuthenticated, // 计算属性，判断用户是否已认证
    isAdmin // 计算属性，判断用户是否是管理员
  }
})
