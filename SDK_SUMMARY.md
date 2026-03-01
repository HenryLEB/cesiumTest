# SDK 化改造总结

## 🎯 改造目标

将项目改造成一个**完全解耦的 SDK**，实现：

1. ✅ 配置与代码分离
2. ✅ 一个 3D Tiles 对应一个配置文件
3. ✅ 易于在其他项目中使用
4. ✅ 标准的 SDK 结构

## 📦 SDK 结构

```
sdk/
├── core/                          # 核心功能
│   ├── MonomerizationSDK.ts      # 主 SDK 类
│   ├── SceneManager.ts            # 场景管理器
│   ├── HighlightManager.ts        # 高亮管理器
│   ├── MarkerManager.ts           # 标记管理器
│   ├── ConfigLoader.ts            # 配置加载器
│   └── EventEmitter.ts            # 事件发射器
├── types/                         # 类型定义
│   └── index.ts                   # 所有类型导出
├── examples/                      # 示例代码
│   ├── basic-usage.ts             # 基本使用示例
│   └── scene-config-example.json  # 配置文件示例
├── index.ts                       # SDK 入口
├── package.json                   # NPM 包配置
├── README.md                      # SDK 文档
└── MIGRATION_TO_SDK.md            # 迁移指南
```

## 🚀 核心特性

### 1. 配置文件驱动

每个场景使用独立的 JSON 配置文件：

```json
{
  "id": "my_scene",
  "name": "我的场景",
  "buildings": [
    {
      "id": "building1",
      "name": "楼栋1",
      "tilesetUrl": "/models/tileset.json",
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

### 2. 简单的 API

```typescript
// 初始化
const sdk = new MonomerizationSDK(viewer, {
  debug: true,
  autoLoadMarkers: true
})

// 加载场景
await sdk.loadSceneFromFile('/config/scene.json')

// 创建单体化
await sdk.createAllHighlights()

// 清理
sdk.destroy()
```

### 3. 事件系统

```typescript
sdk.on('sceneLoaded', (scene) => {
  console.log('场景已加载:', scene.name)
})

sdk.on('highlightCreated', (buildingId) => {
  console.log('高亮已创建:', buildingId)
})
```

### 4. 自动检测模式

```json
{
  "monomerization": {
    "autoDetect": true  // 自动检测模型边界
  }
}
```

### 5. 手动配置模式

```json
{
  "monomerization": {
    "manual": {
      "center": { "x": 0, "y": 0, "z": 0 },
      "dimensions": { "length": 60, "width": 50, "height": 150 },
      "rotation": { "heading": 0, "pitch": 0, "roll": 0 },
      "offset": { "x": 0, "y": 0, "z": 0 }
    }
  }
}
```

## 📝 使用方式

### 方式 1: 作为 SDK 使用

```typescript
import { MonomerizationSDK } from './sdk'

const sdk = new MonomerizationSDK(viewer)
await sdk.loadSceneFromFile('/config/scene.json')
```

### 方式 2: 直接使用核心类

```typescript
import { SceneManager, HighlightManager } from './sdk'

const sceneManager = new SceneManager(viewer)
const highlightManager = new HighlightManager(viewer)
```

### 方式 3: 使用配置加载器

```typescript
import { ConfigLoader } from './sdk'

const loader = new ConfigLoader()
const config = await loader.loadFromFile('/config/scene.json')
```

## 🔄 配置文件组织

### 单项目模式

```
public/
└── config/
    └── scene.json  # 单个配置文件
```

### 多项目模式

```
public/
└── config/
    ├── project_a.json
    ├── project_b.json
    └── project_c.json
```

### 模块化模式

```
public/
└── config/
    ├── base.json           # 基础配置
    ├── buildings/
    │   ├── building1.json
    │   ├── building2.json
    │   └── building3.json
    └── scenes/
        ├── scene1.json
        └── scene2.json
```

## 🎨 配置文件格式

### 最小配置

```json
{
  "id": "scene1",
  "name": "场景1",
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

### 完整配置

```json
{
  "id": "scene1",
  "name": "场景1",
  "description": "场景描述",
  "buildings": [
    {
      "id": "building1",
      "name": "楼栋1",
      "tilesetUrl": "/models/tileset.json",
      "monomerization": {
        "manual": {
          "center": { "x": 0, "y": 0, "z": 0 },
          "dimensions": { "length": 60, "width": 50, "height": 150 },
          "rotation": { "heading": 0, "pitch": 0, "roll": 0 },
          "offset": { "x": 0, "y": 0, "z": 0 }
        },
        "style": {
          "color": "#F26419",
          "alpha": 0.6
        }
      },
      "marker": {
        "longitude": 113.06,
        "latitude": 22.64,
        "height": 100,
        "style": {
          "pointSize": 15,
          "pointColor": "#FFFF00",
          "labelFont": "16pt sans-serif",
          "labelColor": "#FFFF00"
        }
      },
      "info": {
        "powerConsumption": "10000kw-h",
        "waterConsumption": "500m³",
        "population": "30人",
        "customField": "自定义字段"
      }
    }
  ],
  "camera": {
    "longitude": 113.06,
    "latitude": 22.64,
    "height": 1000,
    "heading": 0,
    "pitch": -90,
    "roll": 0
  }
}
```

## 🔧 迁移步骤

### 1. 复制 SDK

```bash
cp -r sdk your-project/src/
```

### 2. 创建配置文件

```bash
# 创建配置目录
mkdir -p public/config

# 创建配置文件
touch public/config/scene.json
```

### 3. 转换现有配置

使用转换脚本或手动转换：

```typescript
// 原配置
const buildingConfigs = [...]

// 转换为 SDK 配置
const sceneConfig = {
  id: 'scene1',
  name: '场景1',
  buildings: buildingConfigs.map(b => ({
    id: b.id,
    name: b.name,
    tilesetUrl: b.tilesetUrl,
    monomerization: {
      manual: {
        center: b.center,
        dimensions: b.dimensions,
        rotation: b.rotation,
        offset: b.offset
      },
      style: {
        color: b.color,
        alpha: 0.6
      }
    },
    marker: b.marker,
    info: b.info
  }))
}
```

### 4. 替换代码

```typescript
// 原代码
const sceneManager = new SceneManager(viewer)
const highlightManager = new HighlightManager(viewer)
// ... 复杂的初始化

// 新代码
const sdk = new MonomerizationSDK(viewer)
await sdk.loadSceneFromFile('/config/scene.json')
```

## 📊 对比

| 特性 | 原方式 | SDK 方式 |
|------|--------|----------|
| 配置方式 | 硬编码 | JSON 文件 |
| 代码行数 | ~200 行 | ~10 行 |
| 管理器数量 | 4 个 | 1 个 |
| 配置复用 | 困难 | 简单 |
| 项目迁移 | 复杂 | 简单 |
| 类型安全 | 部分 | 完全 |
| 事件系统 | 无 | 有 |

## ✨ 优势

### 1. 完全解耦

- 配置文件独立于代码
- 一个 3D Tiles 对应一个配置
- 易于维护和更新

### 2. 易于使用

- 简单的 API
- 自动处理细节
- 完整的类型提示

### 3. 高度可复用

- 复制 SDK 目录即可使用
- 支持任何 Cesium 项目
- 框架无关

### 4. 灵活配置

- 支持自动检测
- 支持手动配置
- 支持配置合并

### 5. 完善的文档

- API 文档
- 使用示例
- 迁移指南

## 📚 文档

- **sdk/README.md** - SDK 完整文档
- **sdk/MIGRATION_TO_SDK.md** - 迁移指南
- **sdk/examples/** - 使用示例
- **SDK_SUMMARY.md** - 本文档

## 🎯 使用场景

### 场景 1: 单个项目

```typescript
const sdk = new MonomerizationSDK(viewer)
await sdk.loadSceneFromFile('/config/scene.json')
```

### 场景 2: 多个项目

```typescript
// 项目 A
await sdk.loadSceneFromFile('/config/project_a.json')

// 切换到项目 B
await sdk.loadScene('project_b')
```

### 场景 3: 动态配置

```typescript
// 从服务器加载
await sdk.loadSceneFromUrl('https://api.example.com/config/scene.json')

// 从对象加载
const config = await fetchConfigFromAPI()
await sdk.loadSceneFromConfig(config)
```

### 场景 4: 自定义扩展

```typescript
import { MonomerizationSDK, ConfigLoader } from './sdk'

class MyCustomSDK extends MonomerizationSDK {
  async loadFromDatabase(id: string) {
    const config = await fetchFromDB(id)
    await this.loadSceneFromConfig(config)
  }
}
```

## 🎉 总结

通过 SDK 化改造，项目实现了：

1. ✅ **完全解耦** - 配置与代码分离
2. ✅ **易于使用** - 简单的 API
3. ✅ **高度复用** - 可用于任何项目
4. ✅ **灵活配置** - 支持多种配置方式
5. ✅ **类型安全** - 完整的 TypeScript 支持
6. ✅ **文档完善** - 详细的使用文档

现在这个系统已经是一个**标准的、可复用的 SDK**，可以轻松应用到任何 Cesium 项目中！

---

SDK 总结 v1.0 | 完成时间: 2026-03-01
