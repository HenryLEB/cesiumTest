<template>
  <div class="cesium-container">
    <div id="cesiumContainer" class="cesium-viewer"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as Cesium from 'cesium'
import type { CesiumViewerExtended } from '../types/building'
import { buildingConfigs } from '../config/buildings'
import { HighlightManager } from '../utils/highlightManager'
import { BuildingManager } from '../utils/buildingManager'
import { InteractionManager } from '../utils/interactionManager'
import { getModelInfo, getModelDimensions } from '../utils/cesiumHelper'
import { logger } from '../utils/logger'

// 响应式数据
const viewer = ref<CesiumViewerExtended | null>(null)

// 管理器实例
let highlightManager: HighlightManager | null = null
let buildingManager: BuildingManager | null = null
let interactionManager: InteractionManager | null = null

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
  }) as CesiumViewerExtended

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
 * 初始化管理器
 */
const initManagers = (): void => {
  if (!viewer.value) return

  highlightManager = new HighlightManager(viewer.value)
  buildingManager = new BuildingManager(viewer.value)
  interactionManager = new InteractionManager(viewer.value, highlightManager, buildingManager)
}

/**
 * 加载所有楼栋
 */
const loadAllBuildings = async (): Promise<void> => {
  if (!buildingManager) return

  for (const config of buildingConfigs) {
    await buildingManager.loadBuilding(config)
  }

  // 创建楼栋实体
  buildingManager.createCylinderEntities(buildingConfigs)
  buildingManager.createLayerEntities()
}

/**
 * 显示默认高亮
 */
const showDefaultHighlight = (): void => {
  setTimeout(() => {
    if (buildingConfigs.length > 0 && highlightManager) {
      const config = buildingConfigs[0]
      if (config) {
        highlightManager.createBuildingHighlight(config)
        buildingManager?.showBuildingInfo(config.id)
      }
    }
  }, 2000)
}

/**
 * 暴露调试工具到全局
 */
const exposeDebugTools = (): void => {
  if (import.meta.env.DEV && viewer.value) {
    (window as any).cesiumDebug = {
      viewer: viewer.value,
      getModelInfo: (url: string) => getModelInfo(url),
      getModelDimensions,
      highlightManager,
      buildingManager,
      interactionManager
    }

    logger.log('🔧 调试工具已加载，可在控制台使用:')
    logger.log('  - cesiumDebug.getModelInfo("/模型路径/tileset.json")')
    logger.log('  - cesiumDebug.getModelDimensions(radius)')
    logger.log('  - cesiumDebug.viewer')
  }
}

// 生命周期钩子
onMounted(async () => {
  initViewer()
  initManagers()
  await loadAllBuildings()
  showDefaultHighlight()
  exposeDebugTools()
})

onBeforeUnmount(() => {
  // 清理资源
  if (highlightManager) {
    highlightManager.destroy()
  }
  if (interactionManager) {
    interactionManager.destroy()
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
