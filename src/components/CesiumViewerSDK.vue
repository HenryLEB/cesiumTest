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

  // 获取点击位置的坐标（无论是否点击到物体）
  const pickPosition = viewer.value.scene.pickPosition(click.position)
  if (Cesium.defined(pickPosition)) {
    const cartographic = Cesium.Cartographic.fromCartesian(pickPosition)
    const longitude = Cesium.Math.toDegrees(cartographic.longitude)
    const latitude = Cesium.Math.toDegrees(cartographic.latitude)
    const height = cartographic.height

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎯 点击位置坐标信息:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📍 世界坐标 (用于 monomerization.manual.center):')
    console.log('  X:', pickPosition.x)
    console.log('  Y:', pickPosition.y)
    console.log('  Z:', pickPosition.z)
    console.log('')
    console.log('🌍 经纬度坐标 (用于 marker):')
    console.log('  经度 (longitude):', longitude)
    console.log('  纬度 (latitude):', latitude)
    console.log('  高度 (height):', height)
    console.log('')
    console.log('📋 配置文件格式 (复制使用):')
    console.log('  "center": {')
    console.log(`    "x": ${pickPosition.x},`)
    console.log(`    "y": ${pickPosition.y},`)
    console.log(`    "z": ${pickPosition.z}`)
    console.log('  },')
    console.log('  "marker": {')
    console.log(`    "longitude": ${longitude},`)
    console.log(`    "latitude": ${latitude},`)
    console.log(`    "height": ${Math.round(height)}`)
    console.log('  }')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  }

  if (Cesium.defined(pickedObject)) {
    console.log('✅ 点击到了物体')

    // 标记是否点击了配置的建筑
    let isConfiguredBuilding = false

    // 检查是否点击了实体
    if (pickedObject.id && pickedObject.id.name) {
      try {
        const modelData = JSON.parse(pickedObject.id.name)

        // 支持点击黄色标记或透明圆柱体
        if (modelData.cesiumType === 'buildingMarker' || modelData.cesiumType === 'cylinderBuilding') {
          isConfiguredBuilding = true
          const buildingId = modelData.buildingId
          console.log('🏢 点击的楼栋ID:', buildingId)

          // 检查是否已经高亮
          const existingHighlight = sdk.getHighlight(buildingId)
          
          if (existingHighlight) {
            // 如果已经高亮，则取消高亮
            console.log('🔄 取消高亮:', buildingId)
            sdk.clearHighlight(buildingId)
            sdk.hideBuildingInfo(buildingId)
          } else {
            // 如果未高亮，先清除其他高亮，再创建新高亮
            console.log('🔄 切换高亮到:', buildingId)
            sdk.clearAllHighlights()
            
            // 隐藏所有信息
            const scene = sdk.getCurrentScene()
            if (scene) {
              const sdkRef = sdk  // Create a const reference for the callback
              scene.buildings.forEach(building => {
                sdkRef.hideBuildingInfo(building.id)
              })
            }

            // 创建新高亮
            sdk.createHighlight(buildingId)

            // 显示楼栋信息
            sdk.showBuildingInfo(buildingId)
          }
        }
      } catch (error) {
        // JSON 解析失败，说明不是配置的建筑实体
        console.log('⚠️ 不是配置的建筑实体')
      }
    }

    // 如果点击的不是配置的建筑（点击了 3D Tiles 模型的其他部分）
    if (!isConfiguredBuilding) {
      console.log('🏗️ 点击了其他建筑（非配置建筑），清除所有高亮')
      
      // 清除所有高亮
      sdk.clearAllHighlights()

      // 隐藏所有信息
      const scene = sdk.getCurrentScene()
      if (scene) {
        const sdkRef = sdk
        scene.buildings.forEach(building => {
          sdkRef.hideBuildingInfo(building.id)
        })
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
    await sdk.loadSceneFromFile('/config/scene_aaa.json')  // ⭐ 切换到 AAA 模型
    console.log('✅ 场景配置加载成功')
  } catch (error) {
    console.error('❌ 加载场景配置失败:', error)
  }

  // 延迟显示默认高亮（已禁用）
  // setTimeout(async () => {
  //   if (!sdk) return
  //   
  //   try {
  //     const scene = sdk.getCurrentScene()
  //     if (scene && scene.buildings && scene.buildings.length > 0) {
  //       const firstBuilding = scene.buildings[0]
  //       if (firstBuilding) {
  //         await sdk.createHighlight(firstBuilding.id)
  //         sdk.showBuildingInfo(firstBuilding.id)
  //       }
  //     }
  //   } catch (error) {
  //     console.error('❌ 创建默认高亮失败:', error)
  //   }
  // }, 2000);

  // 暴露到全局（开发环境）
  if (import.meta.env.DEV) {
    (window as any).sdk = sdk;
    (window as any).viewer = viewer.value;
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔧 开发工具已启用')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📦 全局变量:')
    console.log('  window.sdk    - SDK 实例')
    console.log('  window.viewer - Cesium Viewer 实例')
    console.log('')
    console.log('🎯 常用命令:')
    console.log('  sdk.createHighlight("building_id")  - 创建高亮')
    console.log('  sdk.clearAllHighlights()            - 清除所有高亮')
    console.log('  sdk.getCurrentScene()               - 查看当前场景')
    console.log('')
    console.log('📍 获取模型信息:')
    console.log('  const tileset = viewer.scene.primitives.get(0)')
    console.log('  const center = tileset.boundingSphere.center')
    console.log('  console.log("中心:", center.x, center.y, center.z)')
    console.log('')
    console.log('💡 提示: 点击模型会自动显示坐标信息！')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
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
