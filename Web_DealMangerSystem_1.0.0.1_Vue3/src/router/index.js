/****************************************************************************************************
 * 主要说明（作用）
导入模块: 
  引入 createRouter 和 createWebHistory 用于创建路由实例。
  引入 useAuthStore 用于获取认证状态的 Pinia store 实例。
  引入 ElMessage 用于显示消息提示。
定义路由配置 (routes): 
  定义了应用的所有路由。
  根路径 / 重定向到登录页面 /login。
  登录页面 /login 使用懒加载加载 Login.vue 组件。
  仪表盘页面 /dashboard 需要认证才能访问，并默认重定向到 /dashboard/protocols。
  仪表盘页面包含两个子路由：
    /dashboard/protocols 使用懒加载加载 ProtocolManagement.vue 组件。
    /dashboard/users 使用懒加载加载 UserManagement.vue 组件，并需要管理员权限才能访问。
创建路由实例 (router): 
  使用 createRouter 创建路由实例，并配置使用 createWebHistory 作为路由模式。
路由守卫 (router.beforeEach): 
  在导航前进行权限检查。
  如果目标路由需要认证但用户未认证，重定向到登录页面。
  如果目标路由需要管理员权限但用户不是管理员，显示错误消息并重定向到协议管理页面。
  其他情况下，允许导航。
导出路由实例: 
  将创建的路由实例导出，以便在应用中使用。
 * 
 * ***************************************************************************** */

import { createRouter, createWebHistory } from 'vue-router' // 从vue-router库中引入createRouter和createWebHistory函数
import { useAuthStore } from '@/stores/auth' // 从stores/auth模块中引入useAuthStore函数，用于状态管理
import { ElMessage } from 'element-plus' // 从element-plus库中引入ElMessage组件，用于显示消息提示

// 定义路由配置
const routes = [
  {
    path: '/',
    redirect: '/login' // 当访问根路径时，重定向到登录页面
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue') // 懒加载登录页面组件
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'), // 懒加载仪表盘页面组件
    meta: { requiresAuth: true }, // 需要认证才能访问
    redirect: '/dashboard/protocols', // 默认重定向到协议管理页面
    children: [
      {
        path: 'protocols',
        name: 'Protocols',
        component: () => import('@/views/ProtocolManagement.vue') // 懒加载协议管理子页面组件
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/UserManagement.vue'), // 懒加载用户管理子页面组件
        meta: { requiresAdmin: true } // 需要管理员权限才能访问
      }
    ]
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(), // 使用HTML5 History模式
  routes // 将定义的路由配置传入
})

// 路由守卫，用于在导航前进行权限检查
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore() // 获取认证状态的Pinia store实例

  // 检查目标路由是否需要认证
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login') // 如果未认证，重定向到登录页面
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    ElMessage.error('需要管理员权限') // 如果需要管理员权限但不是管理员，显示错误消息
    next('/dashboard/protocols') // 重定向到协议管理页面
  } else {
    next() // 其他情况下，允许导航
  }
})

// 导出路由实例
export default router
