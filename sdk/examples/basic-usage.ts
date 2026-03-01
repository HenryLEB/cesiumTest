/**
 * 基本使用示例
 */

import * as Cesium from 'cesium'
import { MonomerizationSDK } from '../index'

// 1. 创建 Cesium Viewer
const viewer = new Cesium.Viewer('cesiumContainer', {
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
  scene3DOnly: true
})

// 2. 初始化 SDK
const sdk = new MonomerizationSDK(viewer, {
  debug: true,  // 启用调试模式
  autoLoadMarkers: true  // 自动加载标记
})

// 3. 从配置文件加载场景
async function loadFromFile() {
  await sdk.loadSceneFromFile('/config/scene.json')
  await sdk.createAllHighlights()
}

// 4. 从配置对象加载场景
async function loadFromConfig() {
  const config = {
    id: 'my_scene',
    name: '我的场景',
    buildings: [
      {
        id: 'building1',
        name: '楼栋1',
        tilesetUrl: '/models/tileset.json',
        monomerization: {
          autoDetect: true,
          style: {
            color: '#00FF00',
            alpha: 0.7
          }
        },
        marker: {
          longitude: 113.06,
          latitude: 22.64,
          height: 100
        },
        info: {
          powerConsumption: '10000kw-h',
          waterConsumption: '500m³',
          population: '30人'
        }
      }
    ]
  }

  await sdk.loadSceneFromConfig(config)
  await sdk.createAllHighlights()
}

// 5. 监听事件
sdk.on('sceneLoaded', (scene) => {
  console.log('场景已加载:', scene.name)
})

sdk.on('highlightCreated', (buildingId) => {
  console.log('高亮已创建:', buildingId)
})

// 6. 手动控制高亮
async function manualControl() {
  // 创建特定楼栋的高亮
  await sdk.createHighlight('building1')
  
  // 显示楼栋信息
  sdk.showBuildingInfo('building1')
  
  // 清除高亮
  sdk.clearHighlight('building1')
  
  // 清除所有高亮
  sdk.clearAllHighlights()
}

// 7. 场景切换
async function switchScenes() {
  // 加载场景1
  await sdk.loadSceneFromFile('/config/scene1.json')
  
  // 切换到场景2
  await sdk.loadScene('scene2')
}

// 8. 清理资源
function cleanup() {
  sdk.destroy()
}

// 导出函数供使用
export {
  loadFromFile,
  loadFromConfig,
  manualControl,
  switchScenes,
  cleanup
}
