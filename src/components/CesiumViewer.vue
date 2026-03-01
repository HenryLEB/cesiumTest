<template>
  <div class="cesium-container">
    <div id="cesiumContainer" class="cesium-viewer"></div>
    
    <!-- 场景切换面板（可选） -->
    <div v-if="showSceneSelector" class="scene-selector">
      <h3>场景选择</h3>
      <div 
        v-for="scene in allScenes" 
        :key="scene.id"
        :class="['scene-item', { active: currentSceneId === scene.id }]"
        @click="switchScene(scene.id)"
      >
        <div class="scene-name">{{ scene.name }}</div>
        <div class="scene-desc">{{ scene.description }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as Cesium from 'cesium'
import type { CesiumViewerExtended } from '../types/building'
import { allScenes, defaultScene } from '../config/scenes'
import { SceneManager } from '../utils/sceneManager'
import { HighlightManager } from '../utils/highlightManager'
import { BuildingManager } from '../utils/buildingManager'
import { InteractionManager } from '../utils/interactionManager'
import { MonomerizationHelper } from '../utils/monomerizationHelper'
import { DebugHelper } from '../utils/debugHelper'
import { getModelInfo, getModelDimensions } from '../utils/cesiumHelper'
import { logger } from '../utils/logger'

// Props
interface Props {
  showSceneSelector?: boolean  // 是否显示场景选择器
  initialSceneId?: string      // 初始场景 ID
}

const props = withDefaults(defineProps<Props>(), {
  showSceneSelector: false,
  initialSceneId: undefined
})

// 响应式数据
const viewer = ref<CesiumViewerExtended | null>(null)
const currentSceneId = ref<string | null>(null)

// 管理器实例
let sceneManager: SceneManager | null = null
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

  sceneManager = new SceneManager(viewer.value)
  highlightManager = new HighlightManager(viewer.value)
  buildingManager = new BuildingManager(viewer.value)
  interactionManager = new InteractionManager(viewer.value, highlightManager, buildingManager)

  // 注册所有场景
  sceneManager.registerScenes(allScenes)
}

/**
 * 加载场景
 */
const loadScene = async (sceneId?: string): Promise<void> => {
  if (!sceneManager || !buildingManager) return

  const targetSceneId = sceneId || props.initialSceneId || defaultScene.id
  await sceneManager.loadScene(targetSceneId)
  currentSceneId.value = targetSceneId

  // 为场景中的楼栋创建实体和标记
  const scene = sceneManager.getCurrentScene()
  if (scene) {
    const manager = buildingManager // 避免 TypeScript null 检查问题
    
    // 添加楼栋标记（黄色点和标签）
    scene.buildings.forEach(building => {
      manager.addBuildingMarker(building)
    })
    
    // 创建交互实体
    manager.createCylinderEntities(scene.buildings)
    
    // 创建分层实体
    if (scene.layers) {
      manager.createLayerEntities()
    }
  }
}

/**
 * 切换场景
 */
const switchScene = async (sceneId: string): Promise<void> => {
  if (currentSceneId.value === sceneId) return

  logger.log(`🔄 切换场景: ${sceneId}`)

  // 清除当前高亮
  highlightManager?.clearAll()

  // 加载新场景
  await loadScene(sceneId)

  // 显示默认高亮
  showDefaultHighlight()
}

/**
 * 显示默认高亮
 */
const showDefaultHighlight = (): void => {
  setTimeout(async () => {
    const scene = sceneManager?.getCurrentScene()
    if (scene && scene.buildings.length > 0 && highlightManager) {
      const config = scene.buildings[0]
      if (config) {
        await highlightManager.createBuildingHighlight(config)
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
      getTilesetMetadata: MonomerizationHelper.getTilesetMetadata,
      autoGenerateConfig: MonomerizationHelper.autoGenerateConfig,
      calculateDimensions: MonomerizationHelper.calculateDimensions,
      sceneManager,
      highlightManager,
      buildingManager,
      interactionManager,
      // 调试辅助工具
      debug: DebugHelper,
      // 快捷方法
      logHighlight: (name: string, center: any, rotation: any, offset: any, dimensions: any) => {
        DebugHelper.logHighlightPosition(name, center, rotation, offset, dimensions)
      },
      logTileset: (name: string, tileset: Cesium.Cesium3DTileset) => {
        DebugHelper.logTilesetPosition(name, tileset)
      },
      comparePositions: (name1: string, pos1: any, name2: string, pos2: any) => {
        DebugHelper.comparePositions(name1, pos1, name2, pos2)
      }
    }

    logger.log('🔧 调试工具已加载，可在控制台使用:')
    logger.log('  - cesiumDebug.getModelInfo("/模型路径/tileset.json")')
    logger.log('  - cesiumDebug.getTilesetMetadata("/模型路径/tileset.json")')
    logger.log('  - cesiumDebug.autoGenerateConfig("/模型路径/tileset.json")')
    logger.log('  - cesiumDebug.sceneManager.loadScene("scene2")')
    logger.log('  - cesiumDebug.debug.* (调试辅助工具)')
  }
}

// 生命周期钩子
onMounted(async () => {
  initViewer()
  initManagers()
  await loadScene()
  showDefaultHighlight()
  exposeDebugTools()
})

onBeforeUnmount(() => {
  // 清理资源
  if (sceneManager) {
    sceneManager.destroy()
  }
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

/* 场景选择器样式 */
.scene-selector {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 15px;
  border-radius: 8px;
  min-width: 200px;
  max-width: 300px;
  z-index: 1000;
}

.scene-selector h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: bold;
}

.scene-item {
  padding: 10px;
  margin: 5px 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.scene-item:hover {
  background: rgba(255, 255, 255, 0.2);
}

.scene-item.active {
  background: rgba(242, 100, 25, 0.6);
  border-left: 3px solid #F26419;
}

.scene-name {
  font-weight: bold;
  margin-bottom: 4px;
}

.scene-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}
</style>
