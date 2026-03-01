# 迁移指南

## 快速开始

### 1. 检查新文件结构

优化后的项目结构：

```
src/
├── types/
│   └── building.ts              # 类型定义
├── config/
│   └── buildings.ts             # 配置数据
├── utils/
│   ├── logger.ts                # 日志工具
│   ├── cesiumHelper.ts          # Cesium 辅助函数
│   ├── highlightManager.ts      # 单体化高亮管理
│   ├── buildingManager.ts       # 楼栋管理
│   └── interactionManager.ts    # 交互管理
└── components/
    └── CesiumViewer.vue         # 主组件（已优化）
```

### 2. 安装依赖

```bash
npm install
```

### 3. 运行项目

```bash
npm run dev
```

### 4. 验证功能

打开浏览器访问 `http://localhost:5173/`，验证以下功能：

- ✅ 楼栋模型正常加载
- ✅ 点击楼栋标记显示单体化高亮
- ✅ 点击分层实体显示分层高亮
- ✅ 鼠标滚轮缩放正常
- ✅ 按 R 键重置视图
- ✅ 楼栋信息标签正常显示

## 主要变化

### 代码组织

#### 优化前
```typescript
// 所有代码在一个文件中
// src/components/CesiumViewer.vue (1094 行)
```

#### 优化后
```typescript
// 按功能模块分离
// src/types/building.ts - 类型定义
// src/config/buildings.ts - 配置数据
// src/utils/*.ts - 工具类和管理器
// src/components/CesiumViewer.vue - 主组件（简化）
```

### 类型定义

#### 优化前
```typescript
// 接口定义在组件内部
interface BuildingConfig {
  // ...
}
```

#### 优化后
```typescript
// 独立的类型文件
// src/types/building.ts
export interface BuildingConfig {
  // ...
}
```

### 配置管理

#### 优化前
```typescript
// 配置数据在组件内部
const buildingConfigs: BuildingConfig[] = [...]
```

#### 优化后
```typescript
// 独立的配置文件
// src/config/buildings.ts
export const buildingConfigs: BuildingConfig[] = [...]
```

### 单体化高亮

#### 优化前
```typescript
// 直接操作全局变量
let tilesModelObj: any = null

const createHighlight = () => {
  if (tilesModelObj) {
    scene.primitives.remove(tilesModelObj)
  }
  tilesModelObj = scene.primitives.add(...)
}
```

#### 优化后
```typescript
// 使用管理器类
import { HighlightManager } from '../utils/highlightManager'

const highlightManager = new HighlightManager(viewer.value)
highlightManager.createBuildingHighlight(config)
highlightManager.clearBuildingHighlight()
```

### 交互处理

#### 优化前
```typescript
// 交互逻辑分散在组件中
const setupMouseInteractions = () => {
  canvas.addEventListener('wheel', ...)
  handler.setInputAction(...)
  // ... 大量代码
}
```

#### 优化后
```typescript
// 使用交互管理器
import { InteractionManager } from '../utils/interactionManager'

const interactionManager = new InteractionManager(
  viewer.value,
  highlightManager,
  buildingManager
)
```

## 功能对照表

| 功能 | 优化前 | 优化后 | 说明 |
|------|--------|--------|------|
| 楼栋加载 | `loadBuilding()` | `buildingManager.loadBuilding()` | 封装到管理器 |
| 单体化高亮 | `createBuildingHighlight()` | `highlightManager.createBuildingHighlight()` | 封装到管理器 |
| 分层高亮 | `layeredTilesModel()` | `highlightManager.createLayerHighlight()` | 封装到管理器 |
| 点击交互 | `setupMouseInteractions()` | `interactionManager` | 封装到管理器 |
| 日志输出 | `console.log()` | `logger.log()` | 环境感知 |

## 自定义配置

### 添加新楼栋

编辑 `src/config/buildings.ts`：

```typescript
export const buildingConfigs: BuildingConfig[] = [
  // 现有楼栋...
  {
    id: 'building3',
    name: 'C1栋',
    tilesetUrl: '/models/building3/tileset.json',
    center: {
      x: -2306930.0,
      y: 5418720.0,
      z: 2440500.0
    },
    dimensions: {
      length: 60,
      width: 50,
      height: 150
    },
    rotation: {
      heading: 0.4,
      pitch: 0,
      roll: 0
    },
    offset: {
      x: 0,
      y: 0,
      z: 90
    },
    color: '#00FF00',
    marker: {
      longitude: 113.060,
      latitude: 22.645,
      height: 100
    },
    info: {
      powerConsumption: '20000kw-h',
      waterConsumption: '1000m³',
      population: '50人'
    }
  }
]
```

### 修改高亮颜色

编辑 `src/utils/highlightManager.ts`：

```typescript
// 找到 createBuildingHighlight 方法
color: Cesium.ColorGeometryInstanceAttribute.fromColor(
  Cesium.Color.fromCssColorString(config.color).withAlpha(0.6) // 修改透明度
)
```

### 调整交互灵敏度

编辑 `src/utils/interactionManager.ts`：

```typescript
// 找到 handleZoom 方法
const zoomSpeed = 0.1 // 修改缩放速度
```

## 调试技巧

### 开发环境调试

打开浏览器控制台，使用全局调试对象：

```javascript
// 查看 viewer 实例
cesiumDebug.viewer

// 获取模型信息
cesiumDebug.getModelInfo('/models/tileset.json')

// 计算模型尺寸
cesiumDebug.getModelDimensions(50)

// 访问管理器
cesiumDebug.highlightManager
cesiumDebug.buildingManager
cesiumDebug.interactionManager
```

### 日志控制

```typescript
// 开发环境：显示所有日志
logger.log('调试信息')    // ✅ 显示
logger.warn('警告信息')   // ✅ 显示
logger.error('错误信息')  // ✅ 显示

// 生产环境：只显示错误
logger.log('调试信息')    // ❌ 不显示
logger.warn('警告信息')   // ❌ 不显示
logger.error('错误信息')  // ✅ 显示
```

## 常见问题

### Q1: 编译错误 "Cannot find module"

**原因**: TypeScript 找不到新的模块文件

**解决方案**:
```bash
# 清理缓存并重新安装
rm -rf node_modules
rm package-lock.json
npm install
```

### Q2: 运行时错误 "viewer is null"

**原因**: 组件未正确初始化

**解决方案**: 检查 `onMounted` 钩子是否正确执行

### Q3: 高亮不显示

**原因**: 配置数据可能不正确

**解决方案**:
1. 检查 `src/config/buildings.ts` 中的配置
2. 使用 `cesiumDebug.getModelInfo()` 获取正确的坐标
3. 调整 `center` 和 `offset` 参数

### Q4: 点击没有反应

**原因**: 交互管理器未正确初始化

**解决方案**: 检查 `interactionManager` 是否正确创建

## 性能优化建议

### 1. 按需加载楼栋

```typescript
// 只加载可见区域的楼栋
const loadVisibleBuildings = async () => {
  const visibleConfigs = buildingConfigs.filter(config => {
    // 根据相机位置判断是否可见
    return isVisible(config)
  })
  
  for (const config of visibleConfigs) {
    await buildingManager.loadBuilding(config)
  }
}
```

### 2. 使用对象池

```typescript
// 复用高亮对象而不是每次创建新的
class HighlightPool {
  private pool: Map<string, Cesium.ClassificationPrimitive> = new Map()
  
  get(id: string) {
    return this.pool.get(id)
  }
  
  set(id: string, primitive: Cesium.ClassificationPrimitive) {
    this.pool.set(id, primitive)
  }
}
```

### 3. 延迟加载

```typescript
// 延迟加载非关键资源
setTimeout(() => {
  buildingManager.createCylinderEntities(buildingConfigs)
  buildingManager.createLayerEntities()
}, 1000)
```

## 下一步

1. ✅ 验证所有功能正常工作
2. ✅ 根据需要调整配置
3. ✅ 添加新的楼栋数据
4. ✅ 自定义交互行为
5. ✅ 优化性能

## 获取帮助

- 查看 `OPTIMIZATION.md` 了解优化详情
- 查看 `README.md` 了解项目使用
- 查看 `INTERACTION.md` 了解交互控制

## 回滚方案

如果需要回滚到优化前的版本：

```bash
# 恢复备份文件
cp src/components/CesiumViewer.vue.backup src/components/CesiumViewer.vue

# 删除新增的文件
rm -rf src/types
rm -rf src/config
rm -rf src/utils
```

注意：建议先完整测试优化后的版本，确认无问题后再删除备份。
