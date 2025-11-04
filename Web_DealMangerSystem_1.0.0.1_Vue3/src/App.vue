<template>
  <div id="app">
    <!-- 使用<router-view>组件来渲染匹配到的路由组件 -->
    <router-view />
  </div>
</template>

<script setup>
// 主应用组件
// 这里可以设置全局的响应式状态和逻辑
// 提供一个根容器 <div id="app">，用于容纳整个应用的内容。
// 使用 <router-view /> 组件来根据当前路由动态渲染相应的页面组件。
// 定义全局的样式，确保应用的布局和样式一致性。
</script>

<style>
/* 重置全局样式，确保所有元素的margin和padding为0，并使用border-box盒模型 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 设置#app容器的样式 */
#app {
  /* 设置字体系列，优先使用'Helvetica Neue'，如果不可用则使用Helvetica等 */
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  /* 启用抗锯齿以提高文字渲染质量 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* 设置#app容器的高度为视口高度的100% */
  height: 100vh;
}

/* 设置html和body的高度为100%，确保#app容器可以占满整个视口 */
html, body {
  height: 100%;
}
</style>
