# 如何在两种方式之间切换

项目现在支持两种使用方式：

## 方式 1: 原来的写法（已优化）

使用独立的管理器类，配置在 TypeScript 文件中。

### 文件
- `src/components/CesiumViewer.vue` - 原组件
- `src/config/buildings.ts` - TypeScript 配置
- `src/utils/*` - 各种管理器

### 特点
- ✅ 配置在代码中
- ✅ 完全类型安全
- ✅ 灵活的代码控制
- ❌ 配置与代码耦合

## 方式 2: SDK 方式（推荐）⭐

使用统一的 SDK，配置在 JSON 文件中。

### 文件
- `src/components/CesiumViewerSDK.vue` - SDK 组件
- `public/config/scene.json` - JSON 配置
- `sdk/*` - SDK 核心代码

### 特点
- ✅ 配置与代码分离
- ✅ 简单的 API
- ✅ 易于迁移到其他项目
- ✅ 支持动态加载配置

## 切换方法

编辑 `src/App.vue`：

### 使用原来的写法

```vue
<script setup lang="ts">
// 方式 1: 使用原来的写法（已优化）
import CesiumViewer from './components/CesiumViewer.vue'

// 方式 2: 使用 SDK 版本（推荐）⭐
// import CesiumViewer from './components/CesiumViewerSDK.vue'
</script>

<template>
  <CesiumViewer />
</template>
```

### 使用 SDK 方式

```vue
<script setup lang="ts">
// 方式 1: 使用原来的写法（已优化）
// import CesiumViewer from './components/CesiumViewer.vue'

// 方式 2: 使用 SDK 版本（推荐）⭐
import CesiumViewer from './components/CesiumViewerSDK.vue'
</script>

<template>
  <CesiumViewer />
</template>
```

## 当前状态

**当前使用: SDK 方式** ⭐

## 对比

| 特性 | 原来的写法 | SDK 方式 |
|------|-----------|----------|
| 配置方式 | TypeScript | JSON |
| 代码行数 | ~200 行 | ~100 行 |
| 配置位置 | `src/config/` | `public/config/` |
| 易用性 | 中等 | 简单 |
| 迁移性 | 中等 | 容易 |
| 灵活性 | 高 | 高 |

## 配置文件对比

### 原来的写法 (TypeScript)

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

### SDK 方式 (JSON)

```json
{
  "id": "baoli_project",
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

## 代码对比

### 原来的写法

```typescript
// 需要管理多个管理器
const sceneManager = new SceneManager(viewer.value)
const highlightManager = new HighlightManager(viewer.value)
const buildingManager = new BuildingManager(viewer.value)
const interactionManager = new InteractionManager(viewer.value, highlightManager, buildingManager)

// 加载场景
await loadScene()

// 创建高亮
await highlightManager.createBuildingHighlight(buildingConfigs[0])
```

### SDK 方式

```typescript
// 单一 SDK 实例
const sdk = new MonomerizationSDK(viewer.value, {
  debug: true,
  autoLoadMarkers: true
})

// 加载场景
await sdk.loadSceneFromFile('/config/scene.json')

// 创建高亮
await sdk.createHighlight('building1')
```

## 建议

### 使用原来的写法，如果：
- 需要在代码中动态生成配置
- 需要更细粒度的控制
- 不需要在多个项目间复用

### 使用 SDK 方式，如果：
- 需要配置与代码分离
- 需要在多个项目中使用
- 需要动态加载配置
- 需要简单的 API

## 总结

两种方式都可以正常工作，选择适合你的方式即可。

**推荐使用 SDK 方式**，因为它更简单、更通用、更易于维护。

---

切换指南 v1.0 | 更新时间: 2026-03-02
