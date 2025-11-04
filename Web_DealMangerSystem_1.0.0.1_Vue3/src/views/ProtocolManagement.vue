<template>
    <div class="protocol-management">
      <div class="page-header">
        <h2>协议管理</h2>
        <p>管理系统通信协议，支持添加、查重和导出功能</p>
      </div>
  
      <div class="action-bar">
        <el-button type="primary" @click="showAddDialog = true" :icon="Plus">
          添加协议
        </el-button>
        <el-button type="success" @click="exportToExcel" :icon="Download" :loading="exporting">
          导出Excel
        </el-button>
        <div class="search-area">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索协议..."
            :prefix-icon="Search"
            style="width: 300px"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          />
          <el-button type="primary" @click="handleSearch" :icon="Search">
            搜索
          </el-button>
        </div>
      </div>
  
      <el-card class="table-card">
        <template #header>
          <div class="table-header">
            <span>协议列表</span>
            <div class="table-actions">
              <el-button text :icon="Refresh" @click="fetchProtocols">刷新</el-button>
            </div>
          </div>
        </template>
  
        <el-table 
          :data="filteredProtocols" 
          v-loading="loading"
          stripe
          border
          style="width: 100%"
          :default-sort="{ prop: 'created_at', order: 'descending' }"
        >
          <el-table-column type="index" label="序号" width="60" align="center" />
          
          <el-table-column 
            prop="product_category" 
            label="产品类别" 
            min-width="120"
            show-overflow-tooltip
          />
          
          <el-table-column 
            prop="function_description" 
            label="功能说明" 
            min-width="150"
            show-overflow-tooltip
          />
          
          <el-table-column 
            prop="transmission_direction" 
            label="传输方向" 
            width="100"
            align="center"
          />
          
          <el-table-column 
            prop="frame_header" 
            label="帧头" 
            width="100"
            align="center"
          />
          
          <el-table-column 
            prop="control_word" 
            label="控制字" 
            width="100"
            align="center"
          />
          
          <el-table-column 
            prop="command_word" 
            label="命令字" 
            width="100"
            align="center"
          />
          
          <el-table-column 
            prop="length_identification" 
            label="长度标识" 
            width="100"
            align="center"
          />
          
          <el-table-column 
            prop="data" 
            label="数据" 
            min-width="120"
            show-overflow-tooltip
          />
          
          <el-table-column 
            prop="check_field" 
            label="校验字段" 
            width="100"
            align="center"
          />
          
          <el-table-column 
            prop="frame_end" 
            label="帧尾" 
            width="100"
            align="center"
          />
          
          <el-table-column 
            prop="remark" 
            label="备注" 
            min-width="120"
            show-overflow-tooltip
          />
          
          <el-table-column 
            prop="created_by_name" 
            label="创建人" 
            width="100"
            align="center"
          />
          
          <el-table-column 
            prop="created_at" 
            label="创建时间" 
            width="180"
            align="center"
            sortable
          >
            <template #default="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
          </el-table-column>
  
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="{ row }">
              <el-button 
                type="danger" 
                text 
                :icon="Delete" 
                @click="handleDelete(row)"
                v-if="user.role === 'admin' || row.created_by === user.id"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
  
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
  
      <!-- 添加协议对话框 -->
      <el-dialog 
        v-model="showAddDialog" 
        title="添加协议" 
        width="900px"
        :close-on-click-modal="false"
        @closed="resetForm"
      >
        <el-form 
          :model="newProtocol" 
          :rules="rules" 
          ref="protocolFormRef"
          label-width="120px"
          label-position="left"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="产品类别" prop="product_category">
                <el-select 
                placeholder="请选择产品类型"
                v-model="newProtocol.product_category" 
                  style="width: 100%"
                  clearable
                >
                  <el-option label="系统" value="系统" />
                  <el-option label="人体存在" value="人体存在" />
                  <el-option label="轨迹协议" value="轨迹协议" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="传输方向" prop="transmission_direction">
                <el-select 
                  v-model="newProtocol.transmission_direction" 
                  placeholder="请选择传输方向"
                  style="width: 100%"
                  clearable
                >
                  <el-option label="主动上报" value="主动上报" />
                  <el-option label="设置" value="设置" />
                  <el-option label="设置回复" value="设置回复" />
                  <el-option label="查询" value="查询" />
                  <el-option label="查询回复" value="查询回复" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="功能说明" prop="function_description">
            <el-input 
              v-model="newProtocol.function_description" 
              type="textarea" 
              :rows="2"
              placeholder="请输入功能说明"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
  
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="帧头" prop="frame_header">
                <el-input 
                  v-model="newProtocol.frame_header" 
                  placeholder="请输入帧头"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="控制字" prop="control_word">
                <el-input 
                  v-model="newProtocol.control_word" 
                  placeholder="请输入控制字"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="命令字" prop="command_word">
                <el-input 
                  v-model="newProtocol.command_word" 
                  placeholder="请输入命令字"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>
  
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="长度标识" prop="length_identification">
                <el-input 
                  v-model="newProtocol.length_identification" 
                  placeholder="请输入长度标识"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="校验字段" prop="check_field">
                <el-input 
                  v-model="newProtocol.check_field" 
                  placeholder="请输入校验字段"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="帧尾" prop="frame_end">
                <el-input 
                  v-model="newProtocol.frame_end" 
                  placeholder="请输入帧尾"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>
  
          <el-form-item label="数据" prop="data">
            <el-input 
              v-model="newProtocol.data" 
              type="textarea" 
              :rows="3"
              placeholder="请输入数据内容"
              maxlength="1000"
              show-word-limit
            />
          </el-form-item>
  
          <el-form-item label="备注">
            <el-input 
              v-model="newProtocol.remark" 
              type="textarea" 
              :rows="2"
              placeholder="请输入备注信息（可选）"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-form>
  
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showAddDialog = false">取消</el-button>
            <el-button 
              type="primary" 
              @click="addProtocol" 
              :loading="adding"
            >
              确定
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { 
    Plus, 
    Download, 
    Search, 
    Refresh, 
    Delete 
  } from '@element-plus/icons-vue'
  import api from '@/utils/api'
  
  const router = useRouter()
  const authStore = useAuthStore()
  
  // 响应式数据
  const loading = ref(false)
  const adding = ref(false)
  const exporting = ref(false)
  const showAddDialog = ref(false)
  const searchKeyword = ref('')
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  const protocols = ref([])
  const protocolFormRef = ref()
  
  const user = computed(() => authStore.user)
  
  const newProtocol = reactive({
    product_category: '',
    function_description: '',
    transmission_direction: '',
    frame_header: '',
    control_word: '',
    command_word: '',
    length_identification: '',
    data: '',
    check_field: '',
    frame_end: '',
    remark: ''
  })
  
  // 表单验证规则
  const rules = {
    product_category: [
      { required: true, message: '请输入产品类别', trigger: 'blur' },
      { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
    ],
    function_description: [
      { required: true, message: '请输入功能说明', trigger: 'blur' },
      { min: 1, max: 500, message: '长度在 1 到 500 个字符', trigger: 'blur' }
    ],
    transmission_direction: [
      { required: true, message: '请选择传输方向', trigger: 'change' }
    ],
    frame_header: [
      { required: true, message: '请输入帧头', trigger: 'blur' },
      { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
    ],
    control_word: [
      { required: true, message: '请输入控制字', trigger: 'blur' },
      { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
    ],
    command_word: [
      { required: true, message: '请输入命令字', trigger: 'blur' },
      { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
    ],
    length_identification: [
      { required: true, message: '请输入长度标识', trigger: 'blur' },
      { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
    ],
    data: [
      { required: true, message: '请输入数据', trigger: 'blur' },
      { min: 1, max: 1000, message: '长度在 1 到 1000 个字符', trigger: 'blur' }
    ],
    check_field: [
      { required: true, message: '请输入校验字段', trigger: 'blur' },
      { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
    ],
    frame_end: [
      { required: true, message: '请输入帧尾', trigger: 'blur' },
      { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
    ]
  }
  
  // 计算属性 - 过滤后的协议列表
  const filteredProtocols = computed(() => {
    if (!searchKeyword.value) {
      return protocols.value
    }
    
    const keyword = searchKeyword.value.toLowerCase()
    return protocols.value.filter(protocol => 
      protocol.product_category.toLowerCase().includes(keyword) ||
      protocol.function_description.toLowerCase().includes(keyword) ||
      protocol.transmission_direction.toLowerCase().includes(keyword) ||
      protocol.frame_header.toLowerCase().includes(keyword) ||
      protocol.control_word.toLowerCase().includes(keyword) ||
      protocol.command_word.toLowerCase().includes(keyword) ||
      protocol.data.toLowerCase().includes(keyword) ||
      (protocol.remark && protocol.remark.toLowerCase().includes(keyword))
    )
  })
  
  // 方法
  const fetchProtocols = async () => {
    try {
      loading.value = true
      protocols.value = await api.get('/protocols')
      total.value = protocols.value.length
    } catch (error) {
      console.error('获取协议列表失败:', error)
      ElMessage.error('获取协议列表失败')
    } finally {
      loading.value = false
    }
  }
  
  const addProtocol = async () => {
    if (!protocolFormRef.value) return
    
    try {
      await protocolFormRef.value.validate()
      adding.value = true
  
      await api.post('/protocols', newProtocol)
      
      ElMessage.success('协议添加成功')
      showAddDialog.value = false
      resetForm()
      fetchProtocols()
    } catch (error) {
      if (error.response?.data?.message) {
        ElMessage.error(error.response.data.message)
      } else {
        ElMessage.error('添加协议失败')
      }
    } finally {
      adding.value = false
    }
  }
  
  const handleDelete = async (protocol) => {
    try {
      await ElMessageBox.confirm(
        `确定要删除协议 "${protocol.product_category} - ${protocol.function_description}" 吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
      
      // 调用删除API
      await api.delete(`/protocols/${protocol.id}`)
      
      ElMessage.success('删除成功')
      fetchProtocols()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  }
  
  const exportToExcel = async () => {
    try {
      exporting.value = true
      
      const response = await api.get('/protocols/export', {
        responseType: 'blob'
      })
      
      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `协议数据_${new Date().toISOString().split('T')[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      ElMessage.success('导出成功')
    } catch (error) {
      console.error('导出失败:', error)
      ElMessage.error('导出失败')
    } finally {
      exporting.value = false
    }
  }
  
  const handleSearch = () => {
    currentPage.value = 1
  }
  
  const handleSizeChange = (newSize) => {
    pageSize.value = newSize
    currentPage.value = 1
  }
  
  const handleCurrentChange = (newPage) => {
    currentPage.value = newPage
  }
  
  const resetForm = () => {
    if (protocolFormRef.value) {
      protocolFormRef.value.resetFields()
    }
    Object.keys(newProtocol).forEach(key => {
      newProtocol[key] = ''
    })
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
    fetchProtocols()
  })
  </script>
  
  <style scoped>
  .protocol-management {
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
    flex-wrap: wrap;
    gap: 16px;
  }
  
  .search-area {
    display: flex;
    gap: 12px;
    align-items: center;
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
  
  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #eaeaea;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .action-bar {
      flex-direction: column;
      align-items: stretch;
    }
    
    .search-area {
      width: 100%;
    }
    
    .search-area .el-input {
      flex: 1;
    }
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
  
  /* 对话框样式优化 */
  :deep(.el-dialog) {
    border-radius: 8px;
  }
  
  :deep(.el-dialog__header) {
    padding: 20px 20px 10px;
    border-bottom: 1px solid #eaeaea;
    margin-bottom: 20px;
  }
  
  :deep(.el-dialog__body) {
    padding: 10px 20px;
  }
  
  :deep(.el-dialog__footer) {
    padding: 10px 20px 20px;
    border-top: 1px solid #eaeaea;
  }
  
  /* 表单样式优化 */
  :deep(.el-form-item__label) {
    font-weight: 500;
    color: #606266;
  }
  </style>