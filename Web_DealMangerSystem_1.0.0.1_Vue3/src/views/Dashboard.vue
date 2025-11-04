<template>
    <el-container class="dashboard-container">
      <el-header class="header">
        <div class="header-content">
          <div class="header-left">
            <h1 class="title">协议管理系统</h1>
          </div>
          <div class="header-right">
            <span class="welcome-text">欢迎, {{ user.username }}</span>
            <span class="user-role">({{ user.role === 'admin' ? '管理员' : '用户' }})</span>
            <el-button 
              @click="handleLogout" 
              type="text" 
              class="logout-btn"
            >
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-button>
          </div>
        </div>
      </el-header>
  
      <el-container>
        <el-aside width="250px" class="sidebar">
          <el-menu
            :default-active="activeMenu"
            router
            class="sidebar-menu"
            background-color="#304156"
            text-color="#bfcbd9"
            active-text-color="#409eff"
          >
            <el-menu-item index="/dashboard/protocols">
              <el-icon><Document /></el-icon>
              <span>协议管理</span>
            </el-menu-item>
            <el-menu-item 
              v-if="user.role === 'admin'" 
              index="/dashboard/users"
            >
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
  
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </template>
  
  <script setup>
  import { computed, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import { ElMessageBox, ElMessage } from 'element-plus'
  import { 
    Document, 
    User, 
    SwitchButton 
  } from '@element-plus/icons-vue'
  
  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()
  
  const user = computed(() => authStore.user)
  const activeMenu = computed(() => route.path)
  
  const handleLogout = async () => {
    try {
      await ElMessageBox.confirm('确定要退出登录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      authStore.clearAuth()
      ElMessage.success('退出成功')
      router.push('/login')
    } catch {
      // 用户取消退出
    }
  }
  
  onMounted(() => {
    // 如果没有子路由，默认跳转到协议管理
    if (route.path === '/dashboard') {
      router.push('/dashboard/protocols')
    }
  })
  </script>
  
  <style scoped>
  .dashboard-container {
    height: 100vh;
  }
  
  .header {
    background-color: #409eff;
    color: white;
    padding: 0 20px;
    display: flex;
    align-items: center;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  }
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  
  .header-left .title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  
  .welcome-text {
    font-size: 14px;
  }
  
  .user-role {
    font-size: 12px;
    opacity: 0.8;
  }
  
  .logout-btn {
    color: white;
  }
  
  .logout-btn:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .sidebar {
    background-color: #304156;
  }
  
  .sidebar-menu {
    border: none;
    height: 100%;
  }
  
  .main-content {
    background-color: #f0f2f5;
    padding: 20px;
    overflow: auto;
  }
  </style>