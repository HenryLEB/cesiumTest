<script setup lang="ts">
// 选择使用哪个版本的组件
// 方式 1: 使用原来的写法（已优化）
// import CesiumViewer from './components/CesiumViewer.vue'

// 方式 2: 使用 SDK 版本（推荐）⭐
import CesiumViewer from './components/CesiumViewerSDK.vue'
</script>

<template>
  <CesiumViewer />
</template>
