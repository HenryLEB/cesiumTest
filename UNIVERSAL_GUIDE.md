# 通用化使用指南

## 概述

本项目已经重构为通用的 3D Tiles 单体化框架，支持：

- ✅ 动态加载不同的 3D Tiles 模型
- ✅ 多场景切换
- ✅ 自动检测模型边界并生成单体化配置
- ✅ 手动配置单体化参数
- ✅ 易于迁移到其他项目

## 核心概念

### 1. 场景（Scene）

场景是一组 3D Tiles 模型的集合，每个场景可以包含多个楼栋模型。

```typescript
interface SceneConfig {
  id: string                    // 场景唯一标识
  name: string                  // 场景名称
  description?: string          // 场景描述
  buildings: BuildingConfig[]   // 楼栋配置列表
  layers?: LayerConfig[]        // 分层配置（可选）
  camera?: CameraConfig         // 相机位置（可选）
}
```

### 2. 单体化配置（MonomerizationConfig）

支持两种模式：

#### 自动检测模式
```typescript
{
  autoDetect: true,
  style: {
    color: '#F26419',
    alpha: 0.6
  }
}
```

#### 手动配置模式
```typescript
{
  manual: {
    center: { x: 0, y: 0, z: 0 },
    dimensions: { length: 60, width: 50, height: 150 },
    rotation: { heading: 0, pitch: 0, roll: 0 },
    offset: { x: 0, y: 0, z: 0 }
  },
  style: {
    color: '#F26419',
    alpha: 0.6
  }
}
```

## 快速开始

### 方式 1: 使用场景管理器（推荐）

```typescript
import { SceneManager } from './utils/sceneManager'
import { HighlightManager } from './utils/highlightManager'
import { allScenes } from './config/scenes'

// 1. 创建管理器
const sceneManager = new SceneManager(viewer)
const highlightManager = new HighlightManager(viewer)

// 2. 注册场景
sceneManager.registerScenes(allScenes)

// 3. 加载场景
await sceneManager.loadScene('scene1')

// 4. 创建单体化
const scene = sceneManager.getCurrentScene()
if (scene) {
  for (const building of scene.buildings) {
    await highlightManager.createBuildingHighlight(building)
  }
}
```

### 方式 2: 使用单体化辅助工具

```typescript
import { MonomerizationHelper } from './utils/monomerizationHelper'
import { HighlightManager } from './utils/highlightManager'

// 1. 自动生成配置
const config = await MonomerizationHelper.autoGenerateConfig(
  '/models/tileset.json',
  {
    color: '#00FF00',
    alpha: 0.7
  }
)

// 2. 获取元数据
const metadata = await MonomerizationHelper.getTilesetMetadata(
  '/models/tileset.json'
)

// 3. 创建单体化
if (config && metadata) {
  await highlightManager.createHighlight('building1', config, metadata)
}
```

## 添加新场景

### 步骤 1: 创建场景配置

编辑 `src/config/scenes.ts`：

```typescript
export const myNewScene: SceneConfig = {
  id: 'my_scene',
  name: '我的新场景',
  description: '这是一个新场景',
  buildings: [
    {
      id: 'building1',
      name: '楼栋1',
      tilesetUrl: '/path/to/tileset.json',
      // 使用自动检测，只需提供基本信息
      center: { x: 0, y: 0, z: 0 },  // 可以先填 0，后面自动检测
      dimensions: { length: 0, width: 0, height: 0 },  // 自动计算
      rotation: { heading: 0, pitch: 0, roll: 0 },
      offset: { x: 0, y: 0, z: 0 },
      color: '#FF0000',
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
  ],
  camera: {
    longitude: 113.06,
    latitude: 22.64,
    height: 1000
  }
}

// 添加到场景列表
export const allScenes: SceneConfig[] = [scene1, scene2, myNewScene]
```

### 步骤 2: 自动检测模型参数

使用调试工具获取正确的参数：

```javascript
// 在浏览器控制台执行
const metadata = await cesiumDebug.getTilesetMetadata('/path/to/tileset.json')
console.log('模型中心:', metadata.boundingSphere.center)
console.log('模型半径:', metadata.boundingSphere.radius)

// 计算建议尺寸
const dimensions = cesiumDebug.calculateDimensions(metadata.boundingSphere.radius)
console.log('建议尺寸:', dimensions)
```

### 步骤 3: 更新配置

将获取的参数更新到配置中：

```typescript
{
  id: 'building1',
  name: '楼栋1',
  tilesetUrl: '/path/to/tileset.json',
  center: {
    x: -2306928.4726084634,  // 从 metadata 获取
    y: 5418717.874638036,
    z: 2440505.7478268957
  },
  dimensions: {
    length: 65,  // 从计算结果获取
    width: 50,
    height: 160
  },
  // ... 其他配置
}
```

## 迁移到其他项目

### 步骤 1: 复制核心文件

复制以下文件到新项目：

```
src/
├── types/
│   └── building.ts
├── utils/
│   ├── logger.ts
│   ├── cesiumHelper.ts
│   ├── highlightManager.ts
│   ├── sceneManager.ts
│   └── monomerizationHelper.ts
```

### 步骤 2: 创建配置文件

在新项目中创建 `src/config/scenes.ts`：

```typescript
import type { SceneConfig } from '../types/building'

export const myProjectScene: SceneConfig = {
  id: 'my_project',
  name: '我的项目',
  buildings: [
    // 你的楼栋配置
  ],
  camera: {
    // 你的相机配置
  }
}

export const allScenes = [myProjectScene]
export const defaultScene = myProjectScene
```

### 步骤 3: 初始化系统

```typescript
import { SceneManager } from './utils/sceneManager'
import { HighlightManager } from './utils/highlightManager'
import { allScenes, defaultScene } from './config/scenes'

// 创建 Cesium Viewer
const viewer = new Cesium.Viewer('cesiumContainer', {
  // ... 配置
})

// 初始化管理器
const sceneManager = new SceneManager(viewer)
const highlightManager = new HighlightManager(viewer)

// 注册并加载场景
sceneManager.registerScenes(allScenes)
await sceneManager.loadScene(defaultScene.id)
```

## 高级用法

### 1. 动态切换场景

```typescript
// 切换到场景 2
await sceneManager.loadScene('scene2')

// 清除所有高亮
highlightManager.clearAll()

// 为新场景创建高亮
const scene = sceneManager.getCurrentScene()
if (scene) {
  for (const building of scene.buildings) {
    await highlightManager.createBuildingHighlight(building)
  }
}
```

### 2. 批量自动生成配置

```typescript
import { MonomerizationHelper } from './utils/monomerizationHelper'

const tilesetUrls = [
  '/models/building1/tileset.json',
  '/models/building2/tileset.json',
  '/models/building3/tileset.json'
]

const configs = await MonomerizationHelper.batchGenerateConfigs(
  tilesetUrls,
  {
    color: '#00FF00',
    alpha: 0.7
  }
)

// 使用生成的配置
for (const [url, config] of configs) {
  const metadata = await MonomerizationHelper.getTilesetMetadata(url)
  if (metadata) {
    await highlightManager.createHighlight(url, config, metadata)
  }
}
```

### 3. 从点击位置创建单体化

```typescript
// 监听点击事件
handler.setInputAction((click) => {
  const pickPosition = viewer.scene.pickPosition(click.position)
  
  if (Cesium.defined(pickPosition)) {
    const config = MonomerizationHelper.generateConfigFromClick(
      pickPosition,
      { length: 60, width: 50, height: 150 },
      { color: '#FF0000', alpha: 0.6 }
    )
    
    highlightManager.createHighlight('clicked_building', config)
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK)
```

### 4. 导出/导入配置

```typescript
// 导出配置
const config = highlightManager.getHighlight('building1')?.config
if (config) {
  const json = MonomerizationHelper.exportConfig(config)
  console.log(json)
  // 保存到文件或数据库
}

// 导入配置
const json = '{"manual": {...}, "style": {...}}'
const config = MonomerizationHelper.importConfig(json)
if (config) {
  await highlightManager.createHighlight('imported_building', config)
}
```

## API 参考

### SceneManager

```typescript
class SceneManager {
  registerScene(scene: SceneConfig): void
  registerScenes(scenes: SceneConfig[]): void
  loadScene(sceneId: string): Promise<void>
  clearCurrentScene(): Promise<void>
  getCurrentScene(): SceneConfig | null
  getAllScenes(): SceneConfig[]
  getLoadedTileset(buildingId: string): Cesium.Cesium3DTileset | null
  destroy(): void
}
```

### HighlightManager

```typescript
class HighlightManager {
  createHighlight(id: string, config: MonomerizationConfig, metadata?: TilesetMetadata): Promise<MonomerizationResult | null>
  createBuildingHighlight(config: BuildingConfig): Promise<MonomerizationResult | null>
  createLayerHighlight(layerConfig: LayerConfig): Promise<MonomerizationResult | null>
  clearHighlight(id: string): void
  clearBuildingHighlight(): void
  clearLayerHighlight(): void
  clearAll(): void
  getHighlight(id: string): MonomerizationResult | null
  getAllHighlights(): MonomerizationResult[]
  destroy(): void
}
```

### MonomerizationHelper

```typescript
class MonomerizationHelper {
  static autoGenerateConfig(tilesetUrl: string, options?): Promise<MonomerizationConfig | null>
  static getTilesetMetadata(tilesetUrl: string): Promise<TilesetMetadata | null>
  static generateConfigFromClick(clickPosition, dimensions, options?): MonomerizationConfig
  static generateConfigFromCoordinates(longitude, latitude, height, dimensions, options?): MonomerizationConfig
  static calculateDimensions(boundingSphereRadius, scaleFactor?): Dimensions
  static validateConfig(config: MonomerizationConfig): boolean
  static batchGenerateConfigs(tilesetUrls: string[], options?): Promise<Map<string, MonomerizationConfig>>
  static exportConfig(config: MonomerizationConfig): string
  static importConfig(json: string): MonomerizationConfig | null
}
```

## 最佳实践

### 1. 使用自动检测

对于新模型，优先使用自动检测模式：

```typescript
const config = await MonomerizationHelper.autoGenerateConfig(tilesetUrl)
const metadata = await MonomerizationHelper.getTilesetMetadata(tilesetUrl)
await highlightManager.createHighlight(id, config, metadata)
```

### 2. 配置复用

将常用配置保存为模板：

```typescript
const defaultStyle = {
  color: '#F26419',
  alpha: 0.6
}

const defaultScaleFactor = {
  length: 2,
  width: 1.5,
  height: 2.5
}
```

### 3. 错误处理

始终检查返回值：

```typescript
const result = await highlightManager.createHighlight(id, config, metadata)
if (!result) {
  console.error('创建单体化失败')
  return
}
```

### 4. 资源清理

及时清理不需要的资源：

```typescript
// 切换场景前清理
highlightManager.clearAll()
await sceneManager.clearCurrentScene()

// 组件卸载时清理
onBeforeUnmount(() => {
  highlightManager.destroy()
  sceneManager.destroy()
})
```

## 常见问题

### Q: 如何获取模型的正确坐标？

A: 使用调试工具：

```javascript
const metadata = await cesiumDebug.getTilesetMetadata('/path/to/tileset.json')
console.log(metadata.boundingSphere.center)
```

### Q: 单体化位置不准确怎么办？

A: 调整 `offset` 参数：

```typescript
{
  manual: {
    // ...
    offset: { x: -14, y: 17, z: 93.5 }  // 微调位置
  }
}
```

### Q: 如何支持不同类型的 3D Tiles？

A: 使用自动检测模式，系统会自动适配不同的模型：

```typescript
const config = await MonomerizationHelper.autoGenerateConfig(tilesetUrl)
```

### Q: 可以同时显示多个场景吗？

A: 不建议。建议使用场景切换：

```typescript
await sceneManager.loadScene('scene1')  // 自动清除旧场景
```

## 总结

通过本指南，你可以：

1. ✅ 在当前项目中添加新场景
2. ✅ 动态切换不同的 3D Tiles 模型
3. ✅ 将单体化系统迁移到其他项目
4. ✅ 使用自动检测简化配置
5. ✅ 自定义单体化样式和行为

系统已经完全解耦，不再绑定特定的模型和项目！

---

通用化指南 v1.0 | 更新时间: 2026-03-01
