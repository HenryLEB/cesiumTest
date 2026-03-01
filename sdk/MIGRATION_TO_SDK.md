# 迁移到 SDK 指南

本指南帮助你将现有项目迁移到使用 SDK。

## 迁移步骤

### 步骤 1: 复制 SDK 文件

```bash
# 复制 SDK 目录到你的项目
cp -r sdk your-project/src/
```

### 步骤 2: 转换配置文件

#### 原配置格式 (TypeScript)

```typescript
// src/config/buildings.ts
export const buildingConfigs: BuildingConfig[] = [
  {
    id: 'building1',
    name: 'A6栋',
    tilesetUrl: '/保利b3dm/tileset.json',
    center: { x: -2306928.47, y: 5418717.87, z: 2440505.74 },
    dimensions: { length: 65, width: 50, height: 160 },
    rotation: { heading: 0.4, pitch: 0, roll: 0 },
    offset: { x: -14, y: 17, z: 93.5 },
    color: '#F26419',
    marker: { longitude: 113.06, latitude: 22.64, height: 85 },
    info: {
      powerConsumption: '25410kw-h',
      waterConsumption: '1149m³',
      population: '56人'
    }
  }
]
```

#### 新配置格式 (JSON)

```json
{
  "id": "scene1",
  "name": "保利项目",
  "buildings": [
    {
      "id": "building1",
      "name": "A6栋",
      "tilesetUrl": "/保利b3dm/tileset.json",
      "monomerization": {
        "manual": {
          "center": { "x": -2306928.47, "y": 5418717.87, "z": 2440505.74 },
          "dimensions": { "length": 65, "width": 50, "height": 160 },
          "rotation": { "heading": 0.4, "pitch": 0, "roll": 0 },
          "offset": { "x": -14, "y": 17, "z": 93.5 }
        },
        "style": {
          "color": "#F26419",
          "alpha": 0.6
        }
      },
      "marker": {
        "longitude": 113.06,
        "latitude": 22.64,
        "height": 85
      },
      "info": {
        "powerConsumption": "25410kw-h",
        "waterConsumption": "1149m³",
        "population": "56人"
      }
    }
  ]
}
```

### 步骤 3: 替换代码

#### 原代码

```typescript
// src/components/CesiumViewer.vue
import { SceneManager } from '../utils/sceneManager'
import { HighlightManager } from '../utils/highlightManager'
import { BuildingManager } from '../utils/buildingManager'
import { buildingConfigs } from '../config/buildings'

const sceneManager = new SceneManager(viewer.value)
const highlightManager = new HighlightManager(viewer.value)
const buildingManager = new BuildingManager(viewer.value)

// 加载楼栋
for (const config of buildingConfigs) {
  await buildingManager.loadBuilding(config)
}

// 创建高亮
await highlightManager.createBuildingHighlight(buildingConfigs[0])
```

#### 新代码

```typescript
// src/components/CesiumViewer.vue
import { MonomerizationSDK } from '../sdk'

const sdk = new MonomerizationSDK(viewer.value, {
  debug: true,
  autoLoadMarkers: true
})

// 加载场景
await sdk.loadSceneFromFile('/config/scene.json')

// 创建所有高亮
await sdk.createAllHighlights()
```

### 步骤 4: 更新交互代码

#### 原代码

```typescript
// 点击事件处理
handler.setInputAction((click) => {
  const pickedObject = viewer.scene.pick(click.position)
  if (pickedObject && pickedObject.id) {
    const buildingConfig = buildingConfigs.find(c => c.id === buildingId)
    if (buildingConfig) {
      highlightManager.createBuildingHighlight(buildingConfig)
      buildingManager.showBuildingInfo(buildingConfig.id)
    }
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK)
```

#### 新代码

```typescript
// 点击事件处理
handler.setInputAction((click) => {
  const pickedObject = viewer.scene.pick(click.position)
  if (pickedObject && pickedObject.id) {
    const buildingId = extractBuildingId(pickedObject.id)
    if (buildingId) {
      sdk.createHighlight(buildingId)
      sdk.showBuildingInfo(buildingId)
    }
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK)
```

## 配置转换工具

使用以下脚本自动转换配置：

```typescript
// scripts/convert-config.ts
import { buildingConfigs } from '../src/config/buildings'
import type { SceneConfig } from '../sdk/types'

function convertToSDKConfig(): SceneConfig {
  return {
    id: 'scene1',
    name: '保利项目',
    buildings: buildingConfigs.map(building => ({
      id: building.id,
      name: building.name,
      tilesetUrl: building.tilesetUrl,
      monomerization: {
        manual: {
          center: building.center,
          dimensions: building.dimensions,
          rotation: building.rotation,
          offset: building.offset
        },
        style: {
          color: building.color,
          alpha: 0.6
        }
      },
      marker: building.marker,
      info: building.info
    }))
  }
}

// 导出为 JSON
const config = convertToSDKConfig()
console.log(JSON.stringify(config, null, 2))
```

运行转换：

```bash
npx ts-node scripts/convert-config.ts > public/config/scene.json
```

## 功能对照表

| 原功能 | SDK 方法 |
|--------|----------|
| `sceneManager.loadScene()` | `sdk.loadScene()` |
| `highlightManager.createBuildingHighlight()` | `sdk.createHighlight()` |
| `highlightManager.clearAll()` | `sdk.clearAllHighlights()` |
| `buildingManager.showBuildingInfo()` | `sdk.showBuildingInfo()` |
| `buildingManager.hideAllBuildingInfo()` | `sdk.hideBuildingInfo()` |

## 优势对比

### 原方式

```typescript
// 需要管理多个管理器
const sceneManager = new SceneManager(viewer)
const highlightManager = new HighlightManager(viewer)
const buildingManager = new BuildingManager(viewer)
const interactionManager = new InteractionManager(viewer, highlightManager, buildingManager)

// 需要手动协调
await sceneManager.loadScene('scene1')
buildingManager.createCylinderEntities(buildings)
scene.buildings.forEach(b => buildingManager.addBuildingMarker(b))
```

### SDK 方式

```typescript
// 单一 SDK 实例
const sdk = new MonomerizationSDK(viewer, { autoLoadMarkers: true })

// 自动处理所有细节
await sdk.loadSceneFromFile('/config/scene.json')
await sdk.createAllHighlights()
```

## 注意事项

1. **配置文件位置**: 建议放在 `public/config/` 目录
2. **类型检查**: 使用 TypeScript 时导入类型定义
3. **事件监听**: 使用 SDK 的事件系统替代原有的回调
4. **资源清理**: 组件卸载时调用 `sdk.destroy()`

## 完整示例

### Vue 3 组件

```vue
<template>
  <div id="cesiumContainer"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import * as Cesium from 'cesium'
import { MonomerizationSDK } from '../sdk'

let sdk: MonomerizationSDK | null = null

onMounted(async () => {
  // 创建 Viewer
  const viewer = new Cesium.Viewer('cesiumContainer', {
    // ... 配置
  })

  // 初始化 SDK
  sdk = new MonomerizationSDK(viewer, {
    debug: import.meta.env.DEV,
    autoLoadMarkers: true
  })

  // 加载场景
  await sdk.loadSceneFromFile('/config/scene.json')
  await sdk.createAllHighlights()

  // 监听事件
  sdk.on('highlightCreated', (buildingId) => {
    console.log('高亮已创建:', buildingId)
  })
})

onBeforeUnmount(() => {
  sdk?.destroy()
})
</script>
```

### React 组件

```tsx
import { useEffect, useRef } from 'react'
import * as Cesium from 'cesium'
import { MonomerizationSDK } from '../sdk'

export function CesiumViewer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sdkRef = useRef<MonomerizationSDK | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // 创建 Viewer
    const viewer = new Cesium.Viewer(containerRef.current, {
      // ... 配置
    })

    // 初始化 SDK
    const sdk = new MonomerizationSDK(viewer, {
      debug: process.env.NODE_ENV === 'development',
      autoLoadMarkers: true
    })
    sdkRef.current = sdk

    // 加载场景
    sdk.loadSceneFromFile('/config/scene.json')
      .then(() => sdk.createAllHighlights())

    // 清理
    return () => {
      sdk.destroy()
    }
  }, [])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
```

## 常见问题

### Q: 必须使用 JSON 配置吗？

A: 不是，你也可以使用 TypeScript 对象：

```typescript
import type { SceneConfig } from './sdk/types'

const config: SceneConfig = {
  // ... 配置
}

await sdk.loadSceneFromConfig(config)
```

### Q: 如何保留原有的交互功能？

A: SDK 不影响原有的交互，你可以继续使用 `InteractionManager` 或自定义交互。

### Q: 配置文件可以分开吗？

A: 可以，为每个场景创建独立的配置文件：

```
config/
├── scene1.json
├── scene2.json
└── scene3.json
```

### Q: 如何动态修改配置？

A: 使用 `ConfigLoader` 的合并功能：

```typescript
const loader = new ConfigLoader()
const base = await loader.loadFromFile('/config/base.json')
const override = { buildings: [...] }
const merged = loader.mergeConfigs(base, override)
await sdk.loadSceneFromConfig(merged)
```

## 总结

迁移到 SDK 的主要好处：

1. ✅ 配置与代码完全分离
2. ✅ 更简单的 API
3. ✅ 更好的类型安全
4. ✅ 更容易维护
5. ✅ 更容易在多个项目间复用

---

迁移指南 v1.0 | 更新时间: 2026-03-01
