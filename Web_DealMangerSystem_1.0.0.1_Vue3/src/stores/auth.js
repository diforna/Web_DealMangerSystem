import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))

  const setAuth = (newToken, userData) => {
    token.value = newToken
    user.value = userData
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const clearAuth = () => {
    token.value = ''
    user.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value.role === 'admin')

  return {
    token,
    user,
    setAuth,
    clearAuth,
    isAuthenticated,
    isAdmin
  }
})