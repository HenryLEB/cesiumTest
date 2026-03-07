# 实体类型标识符说明

## 🎯 buildingMarker 和 cylinderBuilding 的来源

这两个标识符是在 `sdk/core/MarkerManager.ts` 中创建 Cesium 实体时设置的。

---

## 📍 buildingMarker（黄色标记）

### 创建位置
**文件**: `sdk/core/MarkerManager.ts`  
**方法**: `addMarker()`  
**行数**: 约 30 行

### 代码
```typescript
const marker = this.viewer.entities.add({
  id: `${building.id}_marker`,
  name: JSON.stringify({ 
    cesiumType: 'buildingMarker',  // ⭐ 这里设置标识符
    buildingId: building.id 
  }),
  position: markerPosition,
  point: {
    pixelSize: 15,
    color: Cesium.Color.YELLOW,  // 黄色点
    // ...
  },
  label: {
    text: `🏢 ${building.name}`,  // 楼栋名称标签
    // ...
  }
})
```

### 说明
- **作用**: 黄色标记点和楼栋名称标签
- **位置**: 楼栋上方（marker 配置的位置）
- **可见**: 始终可见（距离 < 500 米）
- **点击**: 可以点击触发高亮

---

## 🔵 cylinderBuilding（透明圆柱体）

### 创建位置
**文件**: `sdk/core/MarkerManager.ts`  
**方法**: `addCylinderEntity()`  
**行数**: 约 75 行

### 代码
```typescript
const cylinder = this.viewer.entities.add({
  id: `${building.id}_cylinder`,
  name: JSON.stringify({ 
    cesiumType: 'cylinderBuilding',  // ⭐ 这里设置标识符
    buildingId: building.id 
  }),
  position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height - 20),
  cylinder: {
    length: 80,
    topRadius: 23,
    bottomRadius: 23,
    material: Cesium.Color.fromCssColorString('rgba(255, 255, 255, 0.01)'),  // 几乎透明
    // ...
  }
})
```

### 说明
- **作用**: 透明圆柱体，作为点击区域
- **位置**: 楼栋位置（marker 位置下方 20 米）
- **可见**: 几乎透明（alpha: 0.01）
- **点击**: 可以点击触发高亮

---

## 🔄 数据流程

### 1. 创建实体时
```typescript
// MarkerManager.ts
name: JSON.stringify({ 
  cesiumType: 'buildingMarker',  // 设置类型标识
  buildingId: building.id         // 设置楼栋 ID
})
```

### 2. 点击检测时
```typescript
// CesiumViewerSDK.vue - handleClick()
const pickedObject = viewer.scene.pick(click.position)

if (pickedObject.id && pickedObject.id.name) {
  const modelData = JSON.parse(pickedObject.id.name)  // 解析 JSON
  
  // 检查类型
  if (modelData.cesiumType === 'buildingMarker' || 
      modelData.cesiumType === 'cylinderBuilding') {
    const buildingId = modelData.buildingId  // 获取楼栋 ID
    // 执行高亮逻辑
  }
}
```

---

## 📊 实体类型对比

| 类型 | 创建位置 | 外观 | 作用 | 可见性 |
|------|---------|------|------|--------|
| `buildingMarker` | `addMarker()` | 黄色点 + 标签 | 标记楼栋位置 | 始终可见 |
| `cylinderBuilding` | `addCylinderEntity()` | 透明圆柱体 | 点击区域 | 几乎透明 |
| `buildingInfo` | `addInfoLabel()` | 信息标签 | 显示楼栋信息 | 点击后显示 |

---

## 🎨 为什么需要两个实体？

### buildingMarker（黄色标记）
- **优点**: 
  - 视觉明显，容易找到
  - 显示楼栋名称
- **缺点**: 
  - 点击区域小（只有点和标签）
  - 不容易点击

### cylinderBuilding（透明圆柱体）
- **优点**: 
  - 点击区域大，容易点击
  - 覆盖整个楼栋区域
- **缺点**: 
  - 不可见（透明）
  - 需要配置位置和大小

### 结合使用
- ✅ 黄色标记提供视觉引导
- ✅ 透明圆柱体提供大的点击区域
- ✅ 用户可以点击标记或楼栋区域

---

## 🔧 如何添加新的实体类型

### 步骤 1: 在 MarkerManager 中创建实体

```typescript
// sdk/core/MarkerManager.ts
private addCustomEntity(building: BuildingConfig): void {
  const entity = this.viewer.entities.add({
    id: `${building.id}_custom`,
    name: JSON.stringify({ 
      cesiumType: 'customType',  // ⭐ 自定义类型
      buildingId: building.id 
    }),
    // ... 实体配置
  })
}
```

### 步骤 2: 在点击事件中处理

```typescript
// src/components/CesiumViewerSDK.vue - handleClick()
if (modelData.cesiumType === 'buildingMarker' || 
    modelData.cesiumType === 'cylinderBuilding' ||
    modelData.cesiumType === 'customType') {  // ⭐ 添加新类型
  const buildingId = modelData.buildingId
  // 处理点击
}
```

---

## 📝 实体命名规范

### ID 命名
```typescript
`${building.id}_marker`     // 黄色标记
`${building.id}_cylinder`   // 透明圆柱体
`${building.id}_info`       // 信息标签
`${building.id}_custom`     // 自定义实体
```

### name 数据结构
```typescript
{
  cesiumType: 'buildingMarker',  // 实体类型
  buildingId: 'building1'        // 楼栋 ID
}
```

---

## 🎯 常见问题

### Q1: 为什么使用 JSON.stringify？

**A**: Cesium 的 `entity.name` 只能是字符串，所以需要将对象序列化为 JSON 字符串。

```typescript
// 创建时
name: JSON.stringify({ cesiumType: 'buildingMarker', buildingId: 'building1' })

// 点击时
const modelData = JSON.parse(pickedObject.id.name)
```

---

### Q2: 可以修改实体类型名称吗？

**A**: 可以，但需要同时修改两个地方：

1. **MarkerManager.ts** - 创建实体时
```typescript
name: JSON.stringify({ cesiumType: 'myCustomName', buildingId: building.id })
```

2. **CesiumViewerSDK.vue** - 点击检测时
```typescript
if (modelData.cesiumType === 'myCustomName') {
  // ...
}
```

---

### Q3: 如何查看所有实体？

**A**: 在控制台输入：

```javascript
// 查看所有实体
viewer.entities.values.forEach(entity => {
  if (entity.name) {
    try {
      const data = JSON.parse(entity.name)
      console.log('实体:', entity.id, '类型:', data.cesiumType, '楼栋:', data.buildingId)
    } catch (e) {
      console.log('实体:', entity.id, '名称:', entity.name)
    }
  }
})
```

---

### Q4: 如何禁用某种实体的点击？

**A**: 在点击事件中过滤：

```typescript
// 只响应黄色标记，不响应圆柱体
if (modelData.cesiumType === 'buildingMarker') {
  // 只有点击黄色标记才会触发
}
```

---

### Q5: 圆柱体的位置和大小如何调整？

**A**: 在 `MarkerManager.ts` 的 `addCylinderEntity()` 方法中：

```typescript
cylinder: {
  length: 80,        // 高度（调整这个）
  topRadius: 23,     // 顶部半径（调整这个）
  bottomRadius: 23,  // 底部半径（调整这个）
  // ...
}
```

---

## 🎨 可视化说明

```
楼栋模型
    ↑
    |
    |--- 🟡 buildingMarker (黄色标记 + 标签)
    |      - 位置: marker.height
    |      - 可见: 是
    |      - 点击: 可以
    |
    |--- 🔵 cylinderBuilding (透明圆柱体)
    |      - 位置: marker.height - 20
    |      - 可见: 几乎透明
    |      - 点击: 可以
    |      - 作用: 扩大点击区域
    |
    |--- 📋 buildingInfo (信息标签)
           - 位置: marker.height + 10
           - 可见: 点击后显示
           - 点击: 不可点击
```

---

## 💡 总结

**buildingMarker** 和 **cylinderBuilding** 是：
1. ✅ 在 `sdk/core/MarkerManager.ts` 中创建
2. ✅ 通过 `entity.name` 的 JSON 数据传递
3. ✅ 在点击事件中通过 `cesiumType` 识别
4. ✅ 用于区分不同类型的可点击实体

**作用**：
- `buildingMarker`: 视觉标记（黄色点 + 标签）
- `cylinderBuilding`: 点击区域（透明圆柱体）

---

**更新时间**: 2026-03-02  
**版本**: SDK v1.2
