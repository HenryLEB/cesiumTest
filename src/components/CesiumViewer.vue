<template>
  <div class="cesium-container">
    <div id="cesiumContainer" class="cesium-viewer"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as Cesium from 'cesium'

const viewer = ref<Cesium.Viewer | null>(null)
const cameraController = ref<Cesium.ScreenSpaceCameraController | null>(null)

onMounted(async () => {
  // 设置 Cesium 离线模式
  Cesium.Ion.defaultAccessToken = ''

  // 创建 Viewer 实例
  viewer.value = new Cesium.Viewer('cesiumContainer', {
    animation: false, // 关闭动画控制器
    baseLayerPicker: false, // 关闭基础地层选择器
    fullscreenButton: false, // 关闭全屏按钮
    vrButton: false, // 关闭VR按钮
    geocoder: false, // 关闭地址栏
    homeButton: false, // 关闭首页按钮
    infoBox: false, // 关闭信息框
    sceneModePicker: false, // 关闭场景模式选择器
    selectionIndicator: false, // 关闭选择指示器
    timeline: false, // 关闭时间轴
    navigationHelpButton: false, // 关闭导航帮助按钮
    skyBox: false, // 禁用星空
    skyAtmosphere: false, // 禁用大气层
    globe: false, // 禁用地球
  })

  // 隐藏 Cesium Ion 信用标识
  const creditContainer = viewer.value.container.querySelector('.cesium-viewer-bottom')
  if (creditContainer) {
    (creditContainer as HTMLElement).style.display = 'none'
  }

  // 隐藏加载指示器（圆圈）
  const loadingIndicator = viewer.value.container.querySelector('.cesium-viewer-loadingContainer')
  if (loadingIndicator) {
    (loadingIndicator as HTMLElement).style.display = 'none'
  }

  // 设置背景颜色（保持纯色背景）
  viewer.value.scene.backgroundColor = Cesium.Color.fromCssColorString('#000000')

  // 获取摄像头控制器
  cameraController.value = viewer.value.scene.screenSpaceCameraController

  // 启用自定义鼠标交互
  setupMouseInteractions()

  // 加载本地的 3D Tiles 模型
  // 修改路径为你的实际模型路径（例如：/models/tileset.json）
  await loadTileset('/models/tileset.json')
})

const loadTileset = async (tilesetUrl: string) => {
  if (!viewer.value) return

  try {
    // 加载 3D Tiles 模型
    const tileset = await Cesium.Cesium3DTileset.fromUrl(tilesetUrl)
    viewer.value.scene.primitives.add(tileset)

    // 自动适配视图到模型
    viewer.value.zoomTo(tileset, new Cesium.HeadingPitchRange(0, -90, 0))
  } catch (error) {
    console.error('加载 3D Tiles 模型失败:', error)
  }
}

// 设置鼠标交互
const setupMouseInteractions = () => {
  if (!viewer.value) return

  const canvas = viewer.value.scene.canvas as HTMLCanvasElement

  // 鼠标滚轮事件（缩放）
  canvas.addEventListener('wheel', (event: WheelEvent) => {
    event.preventDefault()
    zoomModel(event.deltaY)
  }, { passive: false })

  // 右键菜单禁用
  canvas.addEventListener('contextmenu', (event: MouseEvent) => {
    event.preventDefault()
  })

  // 键盘事件
  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key.toUpperCase() === 'R') {
      resetView()
    }
  })
}

// 缩放模型
const zoomModel = (wheelDelta: number) => {
  if (!viewer.value) return

  const camera = viewer.value.camera
  const zoomSpeed = 0.1

  // 获取模型中心点作为缩放目标
  const primitives = viewer.value.scene.primitives
  if (primitives.length === 0) return
  
  const tileset = primitives.get(0) as Cesium.Cesium3DTileset
  const boundingSphere = tileset.boundingSphere
  if (!boundingSphere) return
  
  // 计算相机到模型中心的向量
  const centerToCamera = Cesium.Cartesian3.subtract(
    camera.position,
    boundingSphere.center,
    new Cesium.Cartesian3()
  )
  
  // 计算当前距离
  const distance = Cesium.Cartesian3.magnitude(centerToCamera)
  
  // 计算缩放后的新距离
  const zoomFactor = wheelDelta > 0 ? 1 + zoomSpeed : 1 - zoomSpeed
  const newDistance = distance * zoomFactor
  
  // 确保距离不会太小或太大
  const clampedDistance = Cesium.Math.clamp(newDistance, 10, 10000)
  
  // 计算新的相机位置
  const direction = Cesium.Cartesian3.normalize(centerToCamera, new Cesium.Cartesian3())
  const newPosition = Cesium.Cartesian3.add(
    boundingSphere.center,
    Cesium.Cartesian3.multiplyByScalar(direction, clampedDistance, new Cesium.Cartesian3()),
    new Cesium.Cartesian3()
  )
  
  // 更新相机位置
  camera.position = newPosition
}

// 重置视图
const resetView = async () => {
  if (!viewer.value) return

  try {
    const primitives = viewer.value.scene.primitives
    if (primitives.length > 0) {
      const tileset = primitives.get(0)
      await viewer.value.zoomTo(tileset, new Cesium.HeadingPitchRange(0, -90, 0))
    }
  } catch (error) {
    console.error('重置视图失败:', error)
  }
}
</script>

<style scoped>
.cesium-container {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
}

.cesium-viewer {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
