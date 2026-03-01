<template>
  <div class="cesium-container">
    <div id="cesiumContainer" class="cesium-viewer"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as Cesium from 'cesium'
import { MonomerizationSDK } from '../../sdk'

// 响应式数据
const viewer = ref<Cesium.Viewer | null>(null)
let sdk: MonomerizationSDK | null = null
let handler: Cesium.ScreenSpaceEventHandler | null = null

/**
 * 初始化 Cesium Viewer
 */
const initViewer = (): void => {
  // 设置 Cesium Ion 访问令牌
  Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZWFlYjAyYS0xN2JlLTQ0OTItOGNkOC05YWJlNGY0MjI2NmQiLCJpZCI6NDkyMjYsImlhdCI6MTYxNzM0NjA3N30.crkTg0Logk_JUA7BROy0r9RqTJWCi8NZpTyu4qI11Fo'

  // 创建 Viewer 实例
  viewer.value = new Cesium.Viewer('cesiumContainer', {
    animation: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    vrButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    navigationHelpButton: false,
    skyBox: false,
    skyAtmosphere: false,
    globe: false,
    scene3DOnly: true,
    terrainProvider: new Cesium.EllipsoidTerrainProvider({})
  })

  // 隐藏 UI 元素
  hideUIElements()

  // 设置背景颜色
  viewer.value.scene.backgroundColor = Cesium.Color.fromCssColorString('#000000')
}

/**
 * 隐藏 UI 元素
 */
const hideUIElements = (): void => {
  if (!viewer.value) return

  const creditContainer = viewer.value.container.querySelector('.cesium-viewer-bottom')
  if (creditContainer) {
    (creditContainer as HTMLElement).style.display = 'none'
  }

  const loadingIndicator = viewer.value.container.querySelector('.cesium-viewer-loadingContainer')
  if (loadingIndicator) {
    (loadingIndicator as HTMLElement).style.display = 'none'
  }
}

/**
 * 设置交互事件
 */
const setupInteractions = (): void => {
  if (!viewer.value) return

  const scene = viewer.value.scene
  handler = new Cesium.ScreenSpaceEventHandler(scene.canvas)

  // 禁用双击缩放
  viewer.value.screenSpaceEventHandler.removeInputAction(
    Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
  )

  // 鼠标滚轮缩放
  const canvas = scene.canvas as HTMLCanvasElement
  canvas.addEventListener('wheel', (event: WheelEvent) => {
    event.preventDefault()
    handleZoom(event.deltaY, event.clientX, event.clientY)
  }, { passive: false })

  // 禁用右键菜单
  canvas.addEventListener('contextmenu', (event: MouseEvent) => {
    event.preventDefault()
  })

  // 键盘事件 - R 键重置视图
  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key.toUpperCase() === 'R') {
      resetView()
    }
  })

  // 点击事件
  handler.setInputAction((click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
    handleClick(click)
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
}

/**
 * 处理点击事件
 */
const handleClick = (click: Cesium.ScreenSpaceEventHandler.PositionedEvent): void => {
  if (!viewer.value || !sdk) return

  const pickedObject = viewer.value.scene.pick(click.position)

  if (Cesium.defined(pickedObject)) {
    console.log('✅ 点击到了物体')

    // 检查是否点击了实体
    if (pickedObject.id && pickedObject.id.name) {
      try {
        const modelData = JSON.parse(pickedObject.id.name)

        // 支持点击黄色标记或透明圆柱体
        if (modelData.cesiumType === 'buildingMarker' || modelData.cesiumType === 'cylinderBuilding') {
          const buildingId = modelData.buildingId
          console.log('🏢 点击的楼栋ID:', buildingId)

          // 清除所有高亮
          sdk.clearAllHighlights()

          // 创建新高亮
          sdk.createHighlight(buildingId)

          // 显示楼栋信息
          sdk.showBuildingInfo(buildingId)
        }
      } catch (error) {
        console.error('解析模型数据失败:', error)
      }
    }
  } else {
    console.log('🖱️ 点击了空白区域')

    if (!sdk) return

    // 清除所有高亮
    sdk.clearAllHighlights()

    // 隐藏所有信息
    const scene = sdk.getCurrentScene()
    if (scene) {
      const sdkRef = sdk  // Create a const reference for the callback
      scene.buildings.forEach(building => {
        sdkRef.hideBuildingInfo(building.id)
      })
    }
  }
}

/**
 * 处理缩放
 */
const handleZoom = (wheelDelta: number, clientX: number, clientY: number): void => {
  if (!viewer.value) return

  const camera = viewer.value.camera
  const zoomSpeed = 0.1

  let zoomTarget: Cesium.Cartesian3

  const mousePosition = new Cesium.Cartesian2(clientX, clientY)
  const pickPosition = viewer.value.scene.pickPosition(mousePosition)

  if (Cesium.defined(pickPosition)) {
    zoomTarget = pickPosition
  } else {
    const primitives = viewer.value.scene.primitives
    if (primitives.length > 0) {
      const tileset = primitives.get(0) as Cesium.Cesium3DTileset
      const boundingSphere = tileset.boundingSphere
      if (boundingSphere) {
        zoomTarget = boundingSphere.center
      } else {
        return
      }
    } else {
      return
    }
  }

  const targetToCamera = Cesium.Cartesian3.subtract(
    camera.position,
    zoomTarget,
    new Cesium.Cartesian3()
  )

  const distance = Cesium.Cartesian3.magnitude(targetToCamera)
  const zoomFactor = wheelDelta > 0 ? 1 + zoomSpeed : 1 - zoomSpeed
  const newDistance = distance * zoomFactor
  const clampedDistance = Cesium.Math.clamp(newDistance, 10, 10000)

  const direction = Cesium.Cartesian3.normalize(targetToCamera, new Cesium.Cartesian3())
  const newPosition = Cesium.Cartesian3.add(
    zoomTarget,
    Cesium.Cartesian3.multiplyByScalar(direction, clampedDistance, new Cesium.Cartesian3()),
    new Cesium.Cartesian3()
  )

  camera.position = newPosition
}

/**
 * 重置视图
 */
const resetView = async (): Promise<void> => {
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

/**
 * 初始化 SDK
 */
const initSDK = async (): Promise<void> => {
  if (!viewer.value) return

  // 创建 SDK 实例
  sdk = new MonomerizationSDK(viewer.value, {
    debug: import.meta.env.DEV,  // 开发环境启用调试
    autoLoadMarkers: true         // 自动加载标记
  })

  // 监听事件
  sdk.on('sceneLoaded', (scene) => {
    console.log('✅ 场景已加载:', scene.name)
  })

  sdk.on('highlightCreated', (buildingId) => {
    console.log('✅ 高亮已创建:', buildingId)
  })

  // 从配置文件加载场景
  try {
    await sdk.loadSceneFromFile('/config/scene.json')
    console.log('✅ 场景配置加载成功')
  } catch (error) {
    console.error('❌ 加载场景配置失败:', error)
  }

  // 延迟显示默认高亮
  setTimeout(async () => {
    if (!sdk) return
    
    try {
      const scene = sdk.getCurrentScene()
      if (scene && scene.buildings && scene.buildings.length > 0) {
        const firstBuilding = scene.buildings[0]
        if (firstBuilding) {
          await sdk.createHighlight(firstBuilding.id)
          sdk.showBuildingInfo(firstBuilding.id)
        }
      }
    } catch (error) {
      console.error('❌ 创建默认高亮失败:', error)
    }
  }, 2000)

  // 暴露到全局（开发环境）
  if (import.meta.env.DEV) {
    (window as any).sdk = sdk
    console.log('🔧 SDK 已暴露到全局: window.sdk')
    console.log('  - sdk.createHighlight("building1")')
    console.log('  - sdk.clearAllHighlights()')
    console.log('  - sdk.getCurrentScene()')
  }
}

// 生命周期钩子
onMounted(async () => {
  initViewer()
  setupInteractions()  // 添加交互
  await initSDK()
})

onBeforeUnmount(() => {
  // 清理资源
  if (handler) {
    handler.destroy()
  }
  if (sdk) {
    sdk.destroy()
  }
  if (viewer.value && !viewer.value.isDestroyed()) {
    viewer.value.destroy()
  }
})
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
