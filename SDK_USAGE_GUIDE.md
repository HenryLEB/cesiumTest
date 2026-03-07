# SDK 使用完整指南

## 📚 目录
1. [整体流程](#整体流程)
2. [3D Tiles 加载位置](#3d-tiles-加载位置)
3. [单体化配置文件](#单体化配置文件)
4. [SDK 使用方式](#sdk-使用方式)
5. [完整示例](#完整示例)

---

## 🔄 整体流程

```
用户打开页面
    ↓
App.vue 加载 CesiumViewerSDK.vue
    ↓
CesiumViewerSDK 初始化 Cesium Viewer
    ↓
创建 MonomerizationSDK 实例
    ↓
SDK 加载配置文件 (public/config/scene.json)
    ↓
SDK 解析配置，加载 3D Tiles 模型
    ↓
SDK 创建黄色标记和透明圆柱体
    ↓
用户可以点击交互
```

---

## 📍 3D Tiles 加载位置

### 1. 入口文件：`src/App.vue`

```vue
<script setup lang="ts">
// 选择使用 SDK 版本
import CesiumViewer from './components/CesiumViewerSDK.vue'
</script>

<template>
  <CesiumViewer />
</template>
```

**作用**：应用的入口，加载 SDK 版本的组件

---

### 2. 组件文件：`src/components/CesiumViewerSDK.vue`

这是 SDK 的使用者，负责：
- 初始化 Cesium Viewer
- 创建 SDK 实例
- 加载配置文件
- 设置交互事件

#### 关键代码：

```typescript
// 1. 初始化 Cesium Viewer
const initViewer = (): void => {
  viewer.value = new Cesium.Viewer('cesiumContainer', {
    // ... 配置选项
  })
}

// 2. 初始化 SDK
const initSDK = async (): Promise<void> => {
  // 创建 SDK 实例
  sdk = new MonomerizationSDK(viewer.value, {
    debug: import.meta.env.DEV,  // 开发环境启用调试
    autoLoadMarkers: true         // 自动加载标记
  })

  // 从配置文件加载场景
  await sdk.loadSceneFromFile('/config/scene.json')  // ⭐ 这里加载配置
}

// 3. 生命周期
onMounted(async () => {
  initViewer()        // 初始化 Viewer
  setupInteractions() // 设置交互
  await initSDK()     // 初始化 SDK（加载 3D Tiles）
})
```

---

### 3. SDK 核心：`sdk/core/MonomerizationSDK.ts`

SDK 的主类，负责协调各个管理器：

```typescript
export class MonomerizationSDK {
  private sceneManager: SceneManager      // 场景管理
  private highlightManager: HighlightManager  // 高亮管理
  private markerManager: MarkerManager    // 标记管理
  private configLoader: ConfigLoader      // 配置加载

  // 从 JSON 文件加载场景
  async loadSceneFromFile(url: string): Promise<void> {
    // 1. 加载配置文件
    const config = await this.configLoader.loadFromFile(url)
    
    // 2. 注册场景
    this.sceneManager.registerScene(config)
    
    // 3. 加载场景（加载 3D Tiles）
    await this.sceneManager.loadScene(config.id)
    
    // 4. 自动加载标记
    if (this.options.autoLoadMarkers) {
      this.loadMarkers(config)
    }
  }
}
```

---

### 4. 配置加载器：`sdk/core/ConfigLoader.ts`

负责加载和验证配置文件：

```typescript
export class ConfigLoader {
  // 从文件加载配置
  async loadFromFile(url: string): Promise<SceneConfig> {
    const response = await fetch(url)
    const config = await response.json()
    this.validateSceneConfig(config)  // 验证配置
    return config
  }
}
```

---

### 5. 场景管理器：`sdk/core/SceneManager.ts`

负责实际加载 3D Tiles 模型：

```typescript
export class SceneManager {
  // 加载场景
  async loadScene(sceneId: string): Promise<void> {
    const scene = this.scenes.get(sceneId)
    
    // 清除旧场景
    this.clearCurrentScene()
    
    // 加载每个楼栋的 3D Tiles
    for (const building of scene.buildings) {
      await this.loadTileset(building)  // ⭐ 这里加载 3D Tiles
    }
    
    this.currentScene = scene
  }

  // 加载 3D Tiles 模型
  private async loadTileset(building: BuildingConfig): Promise<void> {
    const translation = Cesium.Cartesian3.fromArray([0, 0, -170])
    const modelMatrix = Cesium.Matrix4.fromTranslation(translation)

    const tileset = await Cesium.Cesium3DTileset.fromUrl(
      building.tilesetUrl,  // ⭐ 从配置文件读取的 URL
      {
        modelMatrix: modelMatrix,
        maximumScreenSpaceError: 64
      }
    )

    this.viewer.scene.primitives.add(tileset)
    this.loadedTilesets.set(building.id, tileset)
  }
}
```

---

## 📄 单体化配置文件

### 配置文件位置：`public/config/scene.json`

这是整个系统的核心配置文件，定义了：
- 场景信息
- 3D Tiles 模型路径
- 单体化参数
- 标记位置
- 楼栋信息

### 完整配置结构：

```json
{
  "id": "baoli_project",           // 场景 ID
  "name": "保利项目",               // 场景名称
  "description": "保利项目 3D Tiles 单体化场景",
  
  "buildings": [                    // 楼栋列表
    {
      "id": "building1",            // 楼栋 ID
      "name": "A6栋",               // 楼栋名称
      
      // ⭐ 3D Tiles 模型路径
      "tilesetUrl": "/保利b3dm/tileset.json",
      
      // ⭐ 单体化配置
      "monomerization": {
        "manual": {                 // 手动配置模式
          "center": {               // 中心点（世界坐标）
            "x": -2306928.4726084634,
            "y": 5418717.874638036,
            "z": 2440505.7478268957
          },
          "dimensions": {           // 尺寸
            "length": 65,           // 长度
            "width": 50,            // 宽度
            "height": 160           // 高度
          },
          "rotation": {             // 旋转
            "heading": 0.4,         // 偏航角
            "pitch": 0,             // 俯仰角
            "roll": 0               // 翻滚角
          },
          "offset": {               // 偏移
            "x": -14,
            "y": 17,
            "z": 93.5
          }
        },
        "style": {                  // 样式
          "color": "#F26419",       // 高亮颜色
          "alpha": 0.6              // 透明度
        }
      },
      
      // ⭐ 黄色标记位置
      "marker": {
        "longitude": 113.06090721905448,  // 经度
        "latitude": 22.645399902809583,   // 纬度
        "height": 85                       // 高度
      },
      
      // ⭐ 楼栋信息
      "info": {
        "powerConsumption": "25410kw-h",
        "waterConsumption": "1149m³",
        "population": "56人"
      }
    },
    {
      "id": "building2",
      "name": "B1栋",
      // ... 同样的结构
    }
  ],
  
  // 相机初始位置
  "camera": {
    "longitude": 113.06090721905448,
    "latitude": 22.645399902809583,
    "height": 1000,
    "heading": 0,
    "pitch": -90,
    "roll": 0
  }
}
```

### 配置文件说明：

#### 1. `tilesetUrl` - 3D Tiles 模型路径
```json
"tilesetUrl": "/保利b3dm/tileset.json"
```
- 相对于 `public/` 目录
- 实际路径：`public/保利b3dm/tileset.json`
- 可以是本地路径或远程 URL

#### 2. `monomerization` - 单体化配置

**手动模式**（精确控制）：
```json
"monomerization": {
  "manual": {
    "center": { "x": ..., "y": ..., "z": ... },  // 世界坐标
    "dimensions": { "length": 65, "width": 50, "height": 160 },
    "rotation": { "heading": 0.4, "pitch": 0, "roll": 0 },
    "offset": { "x": -14, "y": 17, "z": 93.5 }
  },
  "style": {
    "color": "#F26419",
    "alpha": 0.6
  }
}
```

**自动检测模式**（简单快速）：
```json
"monomerization": {
  "autoDetect": true,  // 自动检测模型边界
  "style": {
    "color": "#F26419",
    "alpha": 0.6
  }
}
```

#### 3. `marker` - 标记位置
```json
"marker": {
  "longitude": 113.06090721905448,  // 经纬度坐标
  "latitude": 22.645399902809583,
  "height": 85
}
```

#### 4. `info` - 楼栋信息
```json
"info": {
  "powerConsumption": "25410kw-h",  // 可以自定义任何字段
  "waterConsumption": "1149m³",
  "population": "56人",
  "customField": "自定义值"
}
```

---

## 🎯 SDK 使用方式

### 方式 1: 在 Vue 组件中使用（当前方式）

**文件**：`src/components/CesiumViewerSDK.vue`

```typescript
import { MonomerizationSDK } from '../../sdk'

// 1. 创建 SDK 实例
const sdk = new MonomerizationSDK(viewer.value, {
  debug: true,           // 启用调试日志
  autoLoadMarkers: true  // 自动加载标记
})

// 2. 加载配置文件
await sdk.loadSceneFromFile('/config/scene.json')

// 3. 使用 SDK API
sdk.createHighlight('building1')      // 创建高亮
sdk.showBuildingInfo('building1')     // 显示信息
sdk.clearAllHighlights()              // 清除高亮

// 4. 监听事件
sdk.on('sceneLoaded', (scene) => {
  console.log('场景已加载:', scene.name)
})

sdk.on('highlightCreated', (buildingId) => {
  console.log('高亮已创建:', buildingId)
})
```

---

### 方式 2: 在其他项目中使用

#### 步骤 1: 复制 SDK 目录
```bash
cp -r sdk your-project/src/
```

#### 步骤 2: 创建配置文件
```bash
# 创建配置目录
mkdir -p public/config

# 创建配置文件
touch public/config/scene.json
```

#### 步骤 3: 编写配置
```json
{
  "id": "my_scene",
  "name": "我的场景",
  "buildings": [
    {
      "id": "building1",
      "name": "楼栋1",
      "tilesetUrl": "/models/tileset.json",  // 你的模型路径
      "monomerization": {
        "autoDetect": true  // 使用自动检测
      },
      "marker": {
        "longitude": 113.06,
        "latitude": 22.64,
        "height": 100
      }
    }
  ]
}
```

#### 步骤 4: 在代码中使用
```typescript
import { MonomerizationSDK } from './sdk'

// 初始化
const sdk = new MonomerizationSDK(viewer, {
  debug: true,
  autoLoadMarkers: true
})

// 加载场景
await sdk.loadSceneFromFile('/config/scene.json')
```

---

## 📖 完整示例

### 示例 1: 基本使用

```typescript
import * as Cesium from 'cesium'
import { MonomerizationSDK } from './sdk'

// 1. 创建 Cesium Viewer
const viewer = new Cesium.Viewer('cesiumContainer', {
  // ... 配置
})

// 2. 创建 SDK 实例
const sdk = new MonomerizationSDK(viewer, {
  debug: true,
  autoLoadMarkers: true
})

// 3. 加载场景
await sdk.loadSceneFromFile('/config/scene.json')

// 4. 创建高亮
await sdk.createHighlight('building1')

// 5. 显示信息
sdk.showBuildingInfo('building1')
```

---

### 示例 2: 多场景切换

```typescript
// 加载场景 A
await sdk.loadSceneFromFile('/config/scene_a.json')

// 切换到场景 B
await sdk.loadSceneFromFile('/config/scene_b.json')
```

---

### 示例 3: 动态配置

```typescript
// 从服务器加载配置
const config = await fetch('https://api.example.com/scene/1').then(r => r.json())

// 使用配置对象
await sdk.loadSceneFromConfig(config)
```

---

### 示例 4: 事件监听

```typescript
// 监听场景加载
sdk.on('sceneLoaded', (scene) => {
  console.log('场景已加载:', scene.name)
  console.log('楼栋数量:', scene.buildings.length)
})

// 监听高亮创建
sdk.on('highlightCreated', (buildingId) => {
  console.log('高亮已创建:', buildingId)
})

// 监听高亮清除
sdk.on('highlightCleared', (buildingId) => {
  console.log('高亮已清除:', buildingId)
})
```

---

### 示例 5: 自定义交互

```typescript
// 设置点击事件
handler.setInputAction((click) => {
  const pickedObject = viewer.scene.pick(click.position)
  
  if (Cesium.defined(pickedObject) && pickedObject.id) {
    const modelData = JSON.parse(pickedObject.id.name)
    
    if (modelData.cesiumType === 'cylinderBuilding') {
      const buildingId = modelData.buildingId
      
      // 清除旧高亮
      sdk.clearAllHighlights()
      
      // 创建新高亮
      await sdk.createHighlight(buildingId)
      
      // 显示信息
      sdk.showBuildingInfo(buildingId)
    }
  } else {
    // 点击空白，清除高亮
    sdk.clearAllHighlights()
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK)
```

---

## 🔍 调试技巧

### 1. 开发环境调试

在浏览器控制台中：

```javascript
// SDK 实例已暴露到全局
window.sdk

// 查看当前场景
sdk.getCurrentScene()

// 创建高亮
sdk.createHighlight('building1')

// 清除高亮
sdk.clearAllHighlights()

// 查看所有高亮
sdk.getAllHighlights()
```

### 2. 查看配置

```javascript
// 查看当前场景配置
const scene = sdk.getCurrentScene()
console.log('场景名称:', scene.name)
console.log('楼栋列表:', scene.buildings)
```

### 3. 查看 3D Tiles 信息

```javascript
// 查看已加载的 Tileset
const tileset = viewer.scene.primitives.get(0)
console.log('Tileset:', tileset)
console.log('边界球:', tileset.boundingSphere)
```

---

## 📊 数据流图

```
配置文件 (scene.json)
    ↓
ConfigLoader.loadFromFile()
    ↓
验证配置
    ↓
MonomerizationSDK.loadSceneFromConfig()
    ↓
SceneManager.registerScene()
    ↓
SceneManager.loadScene()
    ↓
┌─────────────────────────────────┐
│  对每个 building:                │
│  1. SceneManager.loadTileset()  │  ← 加载 3D Tiles
│  2. MarkerManager.addMarker()   │  ← 创建黄色标记
│  3. MarkerManager.addCylinder() │  ← 创建透明圆柱体
└─────────────────────────────────┘
    ↓
场景加载完成
    ↓
用户可以交互
```

---

## 🎯 关键文件总结

| 文件 | 作用 | 说明 |
|------|------|------|
| `src/App.vue` | 应用入口 | 加载 CesiumViewerSDK 组件 |
| `src/components/CesiumViewerSDK.vue` | SDK 使用者 | 初始化 Viewer 和 SDK |
| `public/config/scene.json` | 配置文件 | 定义 3D Tiles 路径和单体化参数 |
| `sdk/core/MonomerizationSDK.ts` | SDK 主类 | 协调各个管理器 |
| `sdk/core/ConfigLoader.ts` | 配置加载器 | 加载和验证配置文件 |
| `sdk/core/SceneManager.ts` | 场景管理器 | 加载 3D Tiles 模型 |
| `sdk/core/HighlightManager.ts` | 高亮管理器 | 创建单体化高亮 |
| `sdk/core/MarkerManager.ts` | 标记管理器 | 创建标记和圆柱体 |

---

## 🚀 快速开始

### 1. 查看当前配置
```bash
# 打开配置文件
code public/config/scene.json
```

### 2. 修改 3D Tiles 路径
```json
{
  "buildings": [
    {
      "tilesetUrl": "/你的模型路径/tileset.json"  // 修改这里
    }
  ]
}
```

### 3. 运行项目
```bash
npm run dev
```

### 4. 在浏览器中测试
- 打开 http://localhost:5173
- 点击楼栋模型查看高亮
- 打开控制台使用 `window.sdk` 调试

---

## 💡 常见问题

### Q1: 如何添加新的楼栋？
在 `scene.json` 中添加新的 building 对象：
```json
{
  "buildings": [
    // ... 现有楼栋
    {
      "id": "building3",
      "name": "C1栋",
      "tilesetUrl": "/models/building3/tileset.json",
      "monomerization": { "autoDetect": true },
      "marker": { "longitude": 113.06, "latitude": 22.64, "height": 100 }
    }
  ]
}
```

### Q2: 如何切换到自动检测模式？
修改配置文件：
```json
"monomerization": {
  "autoDetect": true,  // 改为 true
  "style": {
    "color": "#F26419",
    "alpha": 0.6
  }
}
```

### Q3: 如何在其他项目中使用？
1. 复制 `sdk/` 目录到你的项目
2. 创建 `public/config/scene.json` 配置文件
3. 按照示例代码使用 SDK

---

**更新时间**: 2026-03-02  
**版本**: SDK v1.1
