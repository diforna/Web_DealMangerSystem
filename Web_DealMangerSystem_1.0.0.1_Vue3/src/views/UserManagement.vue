<template>
    <div class="user-management">
      <div class="page-header">
        <h2>用户管理</h2>
        <p>管理系统用户，支持添加、编辑和删除用户</p>
      </div>
  
      <div class="action-bar">
        <el-button type="primary" @click="showAddDialog = true" :icon="Plus">
          添加用户
        </el-button>
      </div>
  
      <el-card class="table-card">
        <template #header>
          <div class="table-header">
            <span>用户列表</span>
            <div class="table-actions">
              <el-button text :icon="Refresh" @click="fetchUsers">刷新</el-button>
            </div>
          </div>
        </template>
  
        <el-table 
          :data="users" 
          v-loading="loading"
          stripe
          border
          style="width: 100%"
        >
          <el-table-column type="index" label="序号" width="60" align="center" />
          
          <el-table-column 
            prop="username" 
            label="用户名" 
            width="120"
          />
          
          <el-table-column 
            prop="email" 
            label="邮箱" 
            min-width="150"
          />
          
          <el-table-column 
            prop="role" 
            label="角色" 
            width="100"
            align="center"
          >
            <template #default="{ row }">
              <el-tag :type="row.role === 'admin' ? 'danger' : 'primary'">
                {{ row.role === 'admin' ? '管理员' : '普通用户' }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column 
            prop="created_at" 
            label="创建时间" 
            width="180"
            align="center"
          >
            <template #default="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
          </el-table-column>
  
          <el-table-column label="操作" width="200" align="center" fixed="right">
            <template #default="{ row }">
              <el-button 
                type="primary" 
                text 
                :icon="Edit" 
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button 
                type="danger" 
                text 
                :icon="Delete" 
                @click="handleDelete(row)"
                v-if="user.id !== row.id"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
  
      <!-- 添加用户对话框 -->
      <el-dialog 
        v-model="showAddDialog" 
        :title="isEditing ? '编辑用户' : '添加用户'" 
        width="500px"
        :close-on-click-modal="false"
        @closed="resetForm"
      >
        <el-form 
          :model="userForm" 
          :rules="rules" 
          ref="userFormRef"
          label-width="80px"
          label-position="left"
        >
          <el-form-item label="用户名" prop="username">
            <el-input 
              v-model="userForm.username" 
              placeholder="请输入用户名"
              :disabled="isEditing"
            />
          </el-form-item>
          
          <el-form-item label="邮箱" prop="email">
            <el-input 
              v-model="userForm.email" 
              placeholder="请输入邮箱"
            />
          </el-form-item>
          
          <el-form-item label="密码" prop="password" v-if="!isEditing">
            <el-input 
              v-model="userForm.password" 
              type="password"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>
          
          <el-form-item label="确认密码" prop="confirmPassword" v-if="!isEditing">
            <el-input 
              v-model="userForm.confirmPassword" 
              type="password"
              placeholder="请确认密码"
              show-password
            />
          </el-form-item>
          
          <el-form-item label="角色" prop="role">
            <el-select v-model="userForm.role" placeholder="请选择角色" style="width: 100%">
              <el-option label="普通用户" value="user" />
              <el-option label="管理员" value="admin" />
            </el-select>
          </el-form-item>
        </el-form>
  
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showAddDialog = false">取消</el-button>
            <el-button 
              type="primary" 
              @click="isEditing ? updateUser() : addUser()" 
              :loading="adding"
            >
              {{ isEditing ? '更新' : '确定' }}
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { 
    Plus, 
    Refresh,
    Edit,
    Delete
  } from '@element-plus/icons-vue'
  import api from '@/utils/api'
  
  const authStore = useAuthStore()
  
  // 响应式数据
  const loading = ref(false)
  const adding = ref(false)
  const showAddDialog = ref(false)
  const isEditing = ref(false)
  const users = ref([])
  const userFormRef = ref()
  
  const user = authStore.user
  
  const userForm = reactive({
    id: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  })
  
  // 表单验证规则
  const validatePassword = (rule, value, callback) => {
    if (!isEditing.value && !value) {
      callback(new Error('请输入密码'))
    } else if (!isEditing.value && value.length < 6) {
      callback(new Error('密码长度不能少于6位'))
    } else {
      callback()
    }
  }
  
  const validateConfirmPassword = (rule, value, callback) => {
    if (!isEditing.value && !value) {
      callback(new Error('请确认密码'))
    } else if (!isEditing.value && value !== userForm.password) {
      callback(new Error('两次输入密码不一致'))
    } else {
      callback()
    }
  }
  
  const rules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
    ],
    email: [
      { required: true, message: '请输入邮箱地址', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
    ],
    password: [
      { validator: validatePassword, trigger: 'blur' }
    ],
    confirmPassword: [
      { validator: validateConfirmPassword, trigger: 'blur' }
    ],
    role: [
      { required: true, message: '请选择用户角色', trigger: 'change' }
    ]
  }
  
  // 方法
  const fetchUsers = async () => {
    try {
      loading.value = true
      users.value = await api.get('/users')
    } catch (error) {
      console.error('获取用户列表失败:', error)
      ElMessage.error('获取用户列表失败')
    } finally {
      loading.value = false
    }
  }
  
  const addUser = async () => {
    if (!userFormRef.value) return
    
    try {
      await userFormRef.value.validate()
      adding.value = true
  
      const { confirmPassword, ...userData } = userForm
      await api.post('/users', userData)
      
      ElMessage.success('用户添加成功')
      showAddDialog.value = false
      resetForm()
      fetchUsers()
    } catch (error) {
      if (error.response?.data?.message) {
        ElMessage.error(error.response.data.message)
      } else {
        ElMessage.error('添加用户失败')
      }
    } finally {
      adding.value = false
    }
  }
  
  const updateUser = async () => {
    if (!userFormRef.value) return
    
    try {
      await userFormRef.value.validate()
      adding.value = true
  
      const { confirmPassword, password, ...userData } = userForm
      if (password) {
        userData.password = password
      }
      
      await api.put(`/users/${userForm.id}`, userData)
      
      ElMessage.success('用户更新成功')
      showAddDialog.value = false
      resetForm()
      fetchUsers()
    } catch (error) {
      if (error.response?.data?.message) {
        ElMessage.error(error.response.data.message)
      } else {
        ElMessage.error('更新用户失败')
      }
    } finally {
      adding.value = false
    }
  }
  
  const handleEdit = (userData) => {
    isEditing.value = true
    Object.assign(userForm, userData)
    userForm.password = ''
    userForm.confirmPassword = ''
    showAddDialog.value = true
  }
  
  const handleDelete = async (userData) => {
    try {
      await ElMessageBox.confirm(
        `确定要删除用户 "${userData.username}" 吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
      
      await api.delete(`/users/${userData.id}`)
      
      ElMessage.success('删除成功')
      fetchUsers()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  }
  
  const resetForm = () => {
    if (userFormRef.value) {
      userFormRef.value.resetFields()
    }
    isEditing.value = false
    Object.keys(userForm).forEach(key => {
      userForm[key] = ''
    })
    userForm.role = 'user'
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }
  
  // 生命周期
  onMounted(() => {
    fetchUsers()
  })
  </script>
  
  <style scoped>
  .user-management {
    padding: 0;
  }
  
  .page-header {
    margin-bottom: 24px;
  }
  
  .page-header h2 {
    margin: 0 0 8px 0;
    font-size: 24px;
    color: #303133;
  }
  
  .page-header p {
    margin: 0;
    color: #606266;
    font-size: 14px;
  }
  
  .action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .table-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
  
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    color: #303133;
  }
  
  .table-actions {
    display: flex;
    gap: 8px;
  }
  
  /* 表格样式优化 */
  :deep(.el-table) {
    font-size: 14px;
  }
  
  :deep(.el-table .cell) {
    padding: 8px 12px;
  }
  
  :deep(.el-table th) {
    background-color: #f5f7fa;
    color: #303133;
    font-weight: 600;
  }
  </style>