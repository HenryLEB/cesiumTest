# Cesium 3D Tiles 单体化 SDK

一个通用的 Cesium 3D Tiles 模型单体化 SDK，支持动态加载配置、场景切换、自动检测等功能。

## 特性

- ✅ 完全解耦 - 配置与代码分离
- ✅ 支持配置文件 - JSON/TypeScript 配置
- ✅ 自动检测 - 自动识别模型边界
- ✅ 场景管理 - 多场景动态切换
- ✅ 类型安全 - 完整的 TypeScript 支持
- ✅ 易于集成 - 简单的 API
- ✅ 框架无关 - 可用于任何项目

## 安装

### 方式 1: 复制到项目

```bash
# 复制 SDK 目录到你的项目
cp -r sdk your-project/src/
```

### 方式 2: NPM 包（未来支持）

```bash
npm install cesium-monomerization-sdk
```

## 快速开始

### 1. 创建配置文件

创建 `config/scene.json`：

```json
{
  "id": "my_scene",
  "name": "我的场景",
  "buildings": [
    {
      "id": "building1",
      "name": "楼栋1",
      "tilesetUrl": "/models/building1/tileset.json",
      "monomerization": {
        "autoDetect": true,
        "style": {
          "color": "#F26419",
          "alpha": 0.6
        }
      },
      "marker": {
        "longitude": 113.06,
        "latitude": 22.64,
        "height": 100
      },
      "info": {
        "powerConsumption": "10000kw-h",
        "waterConsumption": "500m³",
        "population": "30人"
      }
    }
  ]
}
```

### 2. 初始化 SDK

```typescript
import { MonomerizationSDK } from './sdk'
import sceneConfig from './config/scene.json'

// 创建 Cesium Viewer
const viewer = new Cesium.Viewer('cesiumContainer')

// 初始化 SDK
const sdk = new MonomerizationSDK(viewer, {
  debug: true,
  autoLoadMarkers: true
})

// 加载场景配置
await sdk.loadSceneFromConfig(sceneConfig)

// 创建单体化
await sdk.createAllHighlights()
```

### 3. 使用 API

```typescript
// 切换场景
await sdk.loadScene('scene2')

// 创建单体化
await sdk.createHighlight('building1')

// 清除高亮
sdk.clearHighlight('building1')

// 获取场景信息
const scene = sdk.getCurrentScene()
```

## API 文档

### MonomerizationSDK

主 SDK 类，提供所有功能。

#### 构造函数

```typescript
new MonomerizationSDK(viewer: Cesium.Viewer, options?: SDKOptions)
```

**参数**:
- `viewer`: Cesium.Viewer 实例
- `options`: SDK 配置选项
  - `debug`: 是否启用调试模式（默认 false）
  - `autoLoadMarkers`: 是否自动加载标记（默认 true）
  - `modelMatrix`: 全局模型矩阵（可选）

#### 方法

##### loadSceneFromConfig()

从配置对象加载场景。

```typescript
await sdk.loadSceneFromConfig(config: SceneConfig): Promise<void>
```

##### loadSceneFromFile()

从 JSON 文件加载场景。

```typescript
await sdk.loadSceneFromFile(url: string): Promise<void>
```

##### loadScene()

切换到指定场景。

```typescript
await sdk.loadScene(sceneId: string): Promise<void>
```

##### createHighlight()

为指定楼栋创建单体化高亮。

```typescript
await sdk.createHighlight(buildingId: string): Promise<void>
```

##### createAllHighlights()

为所有楼栋创建单体化高亮。

```typescript
await sdk.createAllHighlights(): Promise<void>
```

##### clearHighlight()

清除指定高亮。

```typescript
sdk.clearHighlight(buildingId: string): void
```

##### clearAllHighlights()

清除所有高亮。

```typescript
sdk.clearAllHighlights(): void
```

##### getCurrentScene()

获取当前场景配置。

```typescript
sdk.getCurrentScene(): SceneConfig | null
```

##### destroy()

销毁 SDK，清理所有资源。

```typescript
sdk.destroy(): void
```

## 配置文件格式

### 场景配置 (SceneConfig)

```typescript
interface SceneConfig {
  id: string                    // 场景唯一标识
  name: string                  // 场景名称
  description?: string          // 场景描述
  buildings: BuildingConfig[]   // 楼栋配置列表
  camera?: CameraConfig         // 相机配置
}
```

### 楼栋配置 (BuildingConfig)

```typescript
interface BuildingConfig {
  id: string                    // 楼栋唯一标识
  name: string                  // 楼栋名称
  tilesetUrl: string            // 3D Tiles 模型 URL
  
  // 单体化配置
  monomerization: {
    // 自动检测模式
    autoDetect?: boolean
    // 手动配置模式
    manual?: {
      center: { x: number; y: number; z: number }
      dimensions: { length: number; width: number; height: number }
      rotation?: { heading: number; pitch: number; roll: number }
      offset?: { x: number; y: number; z: number }
    }
    // 样式配置
    style?: {
      color: string
      alpha: number
    }
  }
  
  // 标记配置
  marker?: {
    longitude: number
    latitude: number
    height: number
  }
  
  // 信息配置
  info?: {
    [key: string]: string
  }
}
```

### 相机配置 (CameraConfig)

```typescript
interface CameraConfig {
  longitude: number
  latitude: number
  height: number
  heading?: number
  pitch?: number
  roll?: number
}
```

## 使用示例

### 示例 1: 基本使用

```typescript
import { MonomerizationSDK } from './sdk'

const viewer = new Cesium.Viewer('cesiumContainer')
const sdk = new MonomerizationSDK(viewer)

// 加载配置
await sdk.loadSceneFromFile('/config/scene.json')

// 创建所有高亮
await sdk.createAllHighlights()
```

### 示例 2: 自定义配置

```typescript
const config = {
  id: 'custom_scene',
  name: '自定义场景',
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
      }
    }
  ]
}

await sdk.loadSceneFromConfig(config)
```

### 示例 3: 场景切换

```typescript
// 注册多个场景
await sdk.loadSceneFromFile('/config/scene1.json')
await sdk.loadSceneFromFile('/config/scene2.json')

// 切换场景
await sdk.loadScene('scene1')
await sdk.loadScene('scene2')
```

### 示例 4: 手动控制

```typescript
// 只创建特定楼栋的高亮
await sdk.createHighlight('building1')
await sdk.createHighlight('building2')

// 清除特定高亮
sdk.clearHighlight('building1')

// 清除所有高亮
sdk.clearAllHighlights()
```

### 示例 5: 调试模式

```typescript
const sdk = new MonomerizationSDK(viewer, {
  debug: true  // 启用调试模式
})

// 调试信息会自动输出到控制台
await sdk.loadSceneFromConfig(config)
```

## 配置文件示例

### 完整配置示例

```json
{
  "id": "project_a",
  "name": "项目A",
  "description": "这是项目A的场景配置",
  "buildings": [
    {
      "id": "building1",
      "name": "A栋",
      "tilesetUrl": "/models/buildingA/tileset.json",
      "monomerization": {
        "autoDetect": true,
        "style": {
          "color": "#F26419",
          "alpha": 0.6
        }
      },
      "marker": {
        "longitude": 113.06090721905448,
        "latitude": 22.645399902809583,
        "height": 85
      },
      "info": {
        "powerConsumption": "25410kw-h",
        "waterConsumption": "1149m³",
        "population": "56人",
        "buildingArea": "5000㎡"
      }
    },
    {
      "id": "building2",
      "name": "B栋",
      "tilesetUrl": "/models/buildingB/tileset.json",
      "monomerization": {
        "manual": {
          "center": {
            "x": -2306930.0,
            "y": 5418720.0,
            "z": 2440500.0
          },
          "dimensions": {
            "length": 55,
            "width": 50,
            "height": 160
          },
          "rotation": {
            "heading": 0.4,
            "pitch": 0,
            "roll": 0
          },
          "offset": {
            "x": -83,
            "y": 50,
            "z": 90
          }
        },
        "style": {
          "color": "#FF6B6B",
          "alpha": 0.6
        }
      },
      "marker": {
        "longitude": 113.060277174873093,
        "latitude": 22.645483701548006,
        "height": 100
      },
      "info": {
        "powerConsumption": "18500kw-h",
        "waterConsumption": "950m³",
        "population": "42人"
      }
    }
  ],
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

### 最小配置示例

```json
{
  "id": "simple_scene",
  "name": "简单场景",
  "buildings": [
    {
      "id": "building1",
      "name": "楼栋1",
      "tilesetUrl": "/models/tileset.json",
      "monomerization": {
        "autoDetect": true
      }
    }
  ]
}
```

## 高级用法

### 自定义模型矩阵

```typescript
const sdk = new MonomerizationSDK(viewer, {
  modelMatrix: Cesium.Matrix4.fromTranslation(
    Cesium.Cartesian3.fromArray([0, 0, -170])
  )
})
```

### 事件监听

```typescript
// 场景加载完成
sdk.on('sceneLoaded', (scene) => {
  console.log('场景已加载:', scene.name)
})

// 高亮创建完成
sdk.on('highlightCreated', (buildingId) => {
  console.log('高亮已创建:', buildingId)
})
```

### 批量操作

```typescript
// 批量创建高亮
const buildingIds = ['building1', 'building2', 'building3']
await Promise.all(
  buildingIds.map(id => sdk.createHighlight(id))
)

// 批量清除高亮
buildingIds.forEach(id => sdk.clearHighlight(id))
```

## 最佳实践

### 1. 配置文件组织

```
config/
├── scenes/
│   ├── project_a.json
│   ├── project_b.json
│   └── project_c.json
└── index.ts  # 导出所有配置
```

### 2. 使用 TypeScript

```typescript
import type { SceneConfig } from './sdk/types'

const config: SceneConfig = {
  // TypeScript 会提供类型检查和自动补全
}
```

### 3. 错误处理

```typescript
try {
  await sdk.loadSceneFromFile('/config/scene.json')
} catch (error) {
  console.error('加载场景失败:', error)
}
```

### 4. 资源清理

```typescript
// 组件卸载时清理
onBeforeUnmount(() => {
  sdk.destroy()
})
```

## 迁移指南

### 从现有项目迁移

1. 复制 SDK 文件到项目
2. 将现有配置转换为 JSON 格式
3. 替换原有代码为 SDK API
4. 测试功能

详见 [MIGRATION_TO_SDK.md](./MIGRATION_TO_SDK.md)

## 常见问题

### Q: 如何支持多个项目？

A: 为每个项目创建独立的配置文件，使用 `loadScene()` 切换。

### Q: 配置文件可以动态加载吗？

A: 可以，使用 `loadSceneFromFile()` 从服务器加载。

### Q: 支持哪些 3D Tiles 格式？

A: 支持所有 Cesium 支持的 3D Tiles 格式（b3dm, i3dm, pnts 等）。

### Q: 如何调试位置问题？

A: 启用调试模式 `debug: true`，查看控制台输出。

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request。

## 更新日志

### v1.0.0 (2026-03-01)
- 初始版本
- 支持配置文件
- 支持自动检测
- 支持场景管理

---

SDK 文档 v1.0 | 更新时间: 2026-03-01
