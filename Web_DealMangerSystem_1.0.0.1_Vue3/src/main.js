import { createApp } from 'vue'  // 从Vue库中引入createApp函数，用于创建Vue应用实例
import App from './App.vue'        // 引入根组件App.vue
import router from './router'      // 引入路由配置
import { createPinia } from 'pinia' // 从pinia库中引入createPinia函数，用于创建Pinia实例

// 引入Element Plus库
import ElementPlus from 'element-plus' 
import 'element-plus/dist/index.css'  // 引入Element Plus的样式文件
import * as ElementPlusIconsVue from '@element-plus/icons-vue'  // 引入Element Plus的所有图标组件

const app = createApp(App)  // 创建Vue应用实例，并将根组件App.vue作为参数传入

// 注册所有图标组件，使其可以在全局范围内使用
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {   
  app.component(key, component) 
}

app.use(createPinia())  // 将Pinia实例挂载到Vue应用上，用于状态管理
app.use(router)         // 将路由配置挂载到Vue应用上，用于控制页面跳转
app.use(ElementPlus)    // 将Element Plus库挂载到Vue应用上，用于快速开发UI

app.mount('#app')       // 将Vue应用实例挂载到DOM元素#app上，使其显示在页面中
