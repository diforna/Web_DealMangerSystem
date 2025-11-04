<template>
    <div class="login-container">
      <el-card class="login-card">
        <h2>协议管理系统</h2>
        <el-form 
          :model="form" 
          :rules="rules" 
          ref="loginFormRef"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="用户名"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="密码"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              style="width: 100%"
              :loading="loading"
              @click="handleLogin"
            >
              {{ loading ? '登录中...' : '登录' }}
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="demo-account">
          <p><strong>演示账号</strong></p>
          <p>用户名: admin</p>
          <p>密码: admin123</p>
        </div>
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import { ElMessage } from 'element-plus'
  import { User, Lock } from '@element-plus/icons-vue'
  import api from '@/utils/api'
  
  const router = useRouter()
  const authStore = useAuthStore()
  const loading = ref(false)
  const loginFormRef = ref()
  
  const form = reactive({
    username: '',
    password: ''
  })
  
  const rules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' }
    ]
  }
  
  const handleLogin = async () => {
    if (!loginFormRef.value) return
    
    try {
      await loginFormRef.value.validate()
      loading.value = true
  
      const response = await api.post('/auth/login', form)
      
      authStore.setAuth(response.token, response.user)
      
      ElMessage.success('登录成功')
      router.push('/dashboard')
    } catch (error) {
      ElMessage.error(error.response?.data?.message || '登录失败')
    } finally {
      loading.value = false
    }
  }
  </script>
  
  <style scoped>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  .login-card {
    width: 400px;
    padding: 40px 30px;
  }
  
  h2 {
    text-align: center;
    margin-bottom: 30px;
    color: #333;
    font-weight: 600;
  }
  
  .demo-account {
    margin-top: 30px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #409eff;
  }
  
  .demo-account p {
    margin: 5px 0;
    color: #666;
    font-size: 14px;
  }
  
  .demo-account strong {
    color: #333;
  }
  </style>