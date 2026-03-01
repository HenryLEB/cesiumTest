# 高亮位置调试指南

## 问题描述

改造后高亮区域发生了偏移，与原来的位置不一样。

## 已修复的问题

✅ **SceneManager 缺少 modelMatrix** - 已添加平移矩阵 `[0, 0, -170]`

## 调试工具

现在系统提供了完整的调试工具来帮助你定位和修复位置偏移问题。

### 1. 自动日志输出

在开发环境下，系统会自动打印详细的位置信息：

```javascript
// 打开浏览器控制台，你会看到：

========== A6栋 高亮位置信息 ==========
世界坐标 (center): { x: -2306928.4726084634, y: 5418717.874638036, z: 2440505.7478268957 }
经纬度: { longitude: 113.060907219054480, latitude: 22.645399902809583, height: 85.00 }
旋转 (rotation): { heading: 0.4, pitch: 0, roll: 0 }
偏移 (offset): { x: -14, y: 17, z: 93.5 }
尺寸 (dimensions): { length: 65, width: 50, height: 160 }
==========================================

========== building1 Tileset 位置信息 ==========
边界球中心: { x: -2306928.xxx, y: 5418717.xxx, z: 2440505.xxx }
经纬度: { longitude: 113.xxx, latitude: 22.xxx, height: xxx }
边界球半径: xxx
模型矩阵: Matrix4 { ... }
==========================================
```

### 2. 手动调试工具

在浏览器控制台使用以下命令：

#### 查看 Tileset 位置
```javascript
// 获取已加载的 tileset
const tileset = cesiumDebug.sceneManager.getLoadedTileset('building1')

// 打印位置信息
cesiumDebug.logTileset('building1', tileset)
```

#### 比较位置差异
```javascript
// 获取 tileset 中心
const tileset = cesiumDebug.sceneManager.getLoadedTileset('building1')
const tilesetCenter = tileset.boundingSphere.center

// 获取高亮配置中心
const highlightCenter = new Cesium.Cartesian3(
  -2306928.4726084634,
  5418717.874638036,
  2440505.7478268957
)

// 比较差异
cesiumDebug.comparePositions(
  'Tileset中心',
  tilesetCenter,
  '高亮中心',
  highlightCenter
)
```

#### 可视化边界框
```javascript
// 在 tileset 中心添加调试标记
const tileset = cesiumDebug.sceneManager.getLoadedTileset('building1')
cesiumDebug.debug.addDebugMarker(
  cesiumDebug.viewer,
  tileset.boundingSphere.center,
  'Tileset中心',
  '#FF0000'
)

// 在高亮中心添加调试标记
const highlightCenter = new Cesium.Cartesian3(
  -2306928.4726084634,
  5418717.874638036,
  2440505.7478268957
)
cesiumDebug.debug.addDebugMarker(
  cesiumDebug.viewer,
  highlightCenter,
  '高亮中心',
  '#00FF00'
)
```

## 常见原因和解决方案

### 原因 1: modelMatrix 不一致

**症状**: 高亮整体偏移

**检查**:
```javascript
const tileset = cesiumDebug.sceneManager.getLoadedTileset('building1')
console.log('Tileset modelMatrix:', tileset.modelMatrix)
```

**解决**: 确保 SceneManager 和 BuildingManager 使用相同的 modelMatrix

### 原因 2: center 坐标不准确

**症状**: 高亮位置偏移

**检查**:
```javascript
// 查看 tileset 实际中心
const tileset = cesiumDebug.sceneManager.getLoadedTileset('building1')
console.log('Tileset 中心:', tileset.boundingSphere.center)

// 查看配置中心
const scene = cesiumDebug.sceneManager.getCurrentScene()
const building = scene.buildings[0]
console.log('配置中心:', building.center)
```

**解决**: 更新配置文件中的 center 坐标

### 原因 3: offset 参数不正确

**症状**: 高亮位置略有偏移

**检查**:
```javascript
const scene = cesiumDebug.sceneManager.getCurrentScene()
const building = scene.buildings[0]
console.log('当前 offset:', building.offset)
```

**解决**: 调整 offset 参数

### 原因 4: rotation 参数影响

**症状**: 高亮旋转角度不对

**检查**:
```javascript
const scene = cesiumDebug.sceneManager.getCurrentScene()
const building = scene.buildings[0]
console.log('当前 rotation:', building.rotation)
```

**解决**: 调整 rotation 参数

## 修复步骤

### 步骤 1: 获取正确的坐标

```javascript
// 1. 获取 tileset
const tileset = cesiumDebug.sceneManager.getLoadedTileset('building1')

// 2. 获取边界球信息
const boundingSphere = tileset.boundingSphere
console.log('边界球中心:', {
  x: boundingSphere.center.x,
  y: boundingSphere.center.y,
  z: boundingSphere.center.z
})
console.log('边界球半径:', boundingSphere.radius)

// 3. 转换为经纬度（可选）
const cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center)
console.log('经纬度:', {
  longitude: Cesium.Math.toDegrees(cartographic.longitude),
  latitude: Cesium.Math.toDegrees(cartographic.latitude),
  height: cartographic.height
})
```

### 步骤 2: 更新配置文件

编辑 `src/config/buildings.ts`：

```typescript
{
  id: 'building1',
  name: 'A6栋',
  tilesetUrl: '/保利b3dm/tileset.json',
  center: {
    x: -2306928.4726084634,  // 使用步骤1获取的值
    y: 5418717.874638036,
    z: 2440505.7478268957
  },
  dimensions: {
    length: 65,
    width: 50,
    height: 160
  },
  rotation: {
    heading: 0.4,
    pitch: 0,
    roll: 0
  },
  offset: {
    x: -14,  // 微调这些值
    y: 17,
    z: 93.5
  },
  // ... 其他配置
}
```

### 步骤 3: 微调 offset

如果位置还是不准确，逐步调整 offset：

```javascript
// 在控制台测试不同的 offset 值
const testOffset = { x: -14, y: 17, z: 93.5 }

// 清除当前高亮
cesiumDebug.highlightManager.clearAll()

// 创建新高亮（手动测试）
const scene = cesiumDebug.sceneManager.getCurrentScene()
const building = scene.buildings[0]

// 修改 offset
building.offset = testOffset

// 重新创建高亮
await cesiumDebug.highlightManager.createBuildingHighlight(building)
```

### 步骤 4: 验证结果

```javascript
// 添加调试标记对比
const tileset = cesiumDebug.sceneManager.getLoadedTileset('building1')

// Tileset 中心（红色）
cesiumDebug.debug.addDebugMarker(
  cesiumDebug.viewer,
  tileset.boundingSphere.center,
  'Tileset',
  '#FF0000'
)

// 高亮中心（绿色）
const highlight = cesiumDebug.highlightManager.getHighlight('building1')
// 检查两个标记是否对齐
```

## 快速修复脚本

如果你想快速测试不同的参数，可以使用这个脚本：

```javascript
// 快速测试函数
async function testHighlightPosition(offsetX, offsetY, offsetZ) {
  // 清除当前高亮
  cesiumDebug.highlightManager.clearAll()
  
  // 获取场景和楼栋配置
  const scene = cesiumDebug.sceneManager.getCurrentScene()
  const building = { ...scene.buildings[0] }
  
  // 修改 offset
  building.offset = { x: offsetX, y: offsetY, z: offsetZ }
  
  // 创建新高亮
  await cesiumDebug.highlightManager.createBuildingHighlight(building)
  
  console.log(`测试 offset: x=${offsetX}, y=${offsetY}, z=${offsetZ}`)
}

// 使用示例
await testHighlightPosition(-14, 17, 93.5)  // 原始值
await testHighlightPosition(-10, 20, 90)    // 测试值1
await testHighlightPosition(-15, 15, 95)    // 测试值2
```

## 检查清单

- [ ] SceneManager 是否应用了 modelMatrix `[0, 0, -170]`
- [ ] BuildingManager 是否应用了相同的 modelMatrix
- [ ] center 坐标是否与 tileset 边界球中心一致
- [ ] offset 参数是否合理
- [ ] rotation 参数是否正确
- [ ] dimensions 尺寸是否合适

## 对比原代码

如果还是有问题，可以对比原来的代码：

### 原代码加载方式
```typescript
// 原 CesiumViewer.vue
const translation = Cesium.Cartesian3.fromArray([0, 0, -170])
const m = Cesium.Matrix4.fromTranslation(translation)

const tileset = await Cesium.Cesium3DTileset.fromUrl(config.tilesetUrl, {
  modelMatrix: m,
  maximumScreenSpaceError: 64
})
```

### 新代码加载方式
```typescript
// SceneManager.ts
const translation = Cesium.Cartesian3.fromArray([0, 0, -170])
const modelMatrix = Cesium.Matrix4.fromTranslation(translation)

const tileset = await Cesium.Cesium3DTileset.fromUrl(url, {
  modelMatrix: modelMatrix,
  maximumScreenSpaceError: 64
})
```

两者应该是完全一致的。

## 需要帮助？

如果按照以上步骤还是无法解决，请提供以下信息：

1. 控制台输出的位置信息
2. 偏移的具体表现（截图）
3. 使用的配置参数

---

调试指南 v1.0 | 创建时间: 2026-03-01
