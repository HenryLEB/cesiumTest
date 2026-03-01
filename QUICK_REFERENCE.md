# 快速参考

## 🚀 快速开始

```bash
npm install
npm run dev
```

访问 `http://localhost:5173/`

## 📁 项目结构

```
src/
├── types/building.ts           # 类型定义
├── config/buildings.ts         # 配置数据
├── utils/
│   ├── logger.ts               # 日志
│   ├── cesiumHelper.ts         # Cesium 工具
│   ├── highlightManager.ts     # 高亮管理
│   ├── buildingManager.ts      # 楼栋管理
│   └── interactionManager.ts   # 交互管理
└── components/
    └── CesiumViewer.vue        # 主组件
```

## 🎮 交互控制

| 操作 | 控制 |
|------|------|
| 旋转 | 左键拖动 |
| 移动 | 右键拖动 |
| 缩放 | 鼠标滚轮 |
| 重置 | R 键 |

## 🔧 常用操作

### 添加新楼栋

编辑 `src/config/buildings.ts`：

```typescript
export const buildingConfigs: BuildingConfig[] = [
  {
    id: 'building3',
    name: 'C1栋',
    tilesetUrl: '/models/building3/tileset.json',
    center: { x: 0, y: 0, z: 0 },
    dimensions: { length: 60, width: 50, height: 150 },
    rotation: { heading: 0, pitch: 0, roll: 0 },
    offset: { x: 0, y: 0, z: 90 },
    color: '#00FF00',
    marker: { longitude: 113.06, latitude: 22.64, height: 100 },
    info: {
      powerConsumption: '20000kw-h',
      waterConsumption: '1000m³',
      population: '50人'
    }
  }
]
```

### 调整高亮颜色

编辑 `src/utils/highlightManager.ts`：

```typescript
// 修改透明度
.withAlpha(0.6) // 改为 0.8
```

### 调整缩放速度

编辑 `src/utils/interactionManager.ts`：

```typescript
const zoomSpeed = 0.1 // 改为 0.2
```

## 🐛 调试

打开浏览器控制台：

```javascript
// 查看 viewer
cesiumDebug.viewer

// 获取模型信息
cesiumDebug.getModelInfo('/models/tileset.json')

// 计算尺寸
cesiumDebug.getModelDimensions(50)

// 访问管理器
cesiumDebug.highlightManager
cesiumDebug.buildingManager
cesiumDebug.interactionManager
```

## 📝 日志控制

```typescript
import { logger } from './utils/logger'

logger.log('调试信息')    // 仅开发环境
logger.warn('警告')       // 仅开发环境
logger.error('错误')      // 始终显示
```

## 🏗️ 构建

```bash
# 开发
npm run dev

# 构建
npm run build

# 预览
npm run preview
```

## 📚 文档

- `README.md` - 项目说明
- `OPTIMIZATION.md` - 优化详情
- `MIGRATION_GUIDE.md` - 迁移指南
- `OPTIMIZATION_SUMMARY.md` - 优化总结
- `QUICK_REFERENCE.md` - 快速参考（本文件）

## 🎯 核心类

### HighlightManager

```typescript
const manager = new HighlightManager(viewer)
manager.createBuildingHighlight(config)
manager.createLayerHighlight(layerConfig)
manager.clearBuildingHighlight()
manager.clearLayerHighlight()
manager.clearAll()
manager.destroy()
```

### BuildingManager

```typescript
const manager = new BuildingManager(viewer)
await manager.loadBuilding(config)
manager.addBuildingMarker(config)
manager.showBuildingInfo(buildingId)
manager.hideAllBuildingInfo(configs)
manager.createCylinderEntities(configs)
manager.createLayerEntities()
```

### InteractionManager

```typescript
const manager = new InteractionManager(
  viewer,
  highlightManager,
  buildingManager
)
// 自动处理所有交互
manager.destroy()
```

## 🔍 类型定义

```typescript
interface BuildingConfig {
  id: string
  name: string
  tilesetUrl: string
  center: { x: number; y: number; z: number }
  dimensions: { length: number; width: number; height: number }
  rotation: { heading: number; pitch: number; roll: number }
  offset: { x: number; y: number; z: number }
  color: string
  marker: { longitude: number; latitude: number; height: number }
  info: {
    powerConsumption: string
    waterConsumption: string
    population: string
  }
}

interface LayerConfig {
  id: string
  name: string
  offset: { x: number; y: number; z: number }
  rotation: { heading: number; pitch: number; roll: number }
  dimensions: { length: number; width: number; height: number }
  color: string
  height: number
}
```

## ⚡ 性能提示

1. 按需加载楼栋
2. 复用高亮对象
3. 延迟加载非关键资源
4. 使用对象池
5. 及时清理资源

## 🆘 常见问题

### 编译错误
```bash
rm -rf node_modules
npm install
```

### 高亮不显示
检查配置数据，使用 `cesiumDebug.getModelInfo()` 获取正确坐标

### 点击无反应
检查 `interactionManager` 是否正确初始化

### 内存泄漏
确保在 `onBeforeUnmount` 中调用 `destroy()`

## 📞 获取帮助

1. 查看详细文档
2. 检查浏览器控制台
3. 使用调试工具
4. 查看示例代码

---

快速参考 v2.0 | 更新时间: 2026-03-01
