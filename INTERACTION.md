# 点击交互说明

## 当前交互行为

### 1. 点击配置的建筑（未高亮）
- 清除其他所有高亮
- 高亮当前点击的建筑
- 显示建筑信息标签

### 2. 点击配置的建筑（已高亮）
- 取消当前建筑的高亮
- 隐藏建筑信息标签

### 3. 点击其他建筑（非配置建筑）
- 清除所有高亮
- 隐藏所有信息标签
- 控制台显示：🏗️ 点击了其他建筑（非配置建筑）

### 4. 点击空白区域
- 清除所有高亮
- 隐藏所有信息标签

## 示例流程

```
初始状态: 无高亮
  ↓
点击配置建筑 B1 → B1 高亮 + 显示 B1 信息
  ↓
点击配置建筑 B2 → B1 取消高亮 + B2 高亮 + 显示 B2 信息
  ↓
点击其他建筑（非配置） → B2 取消高亮 + 所有信息隐藏
  ↓
点击空白 → 所有高亮清除 + 所有信息隐藏
```

## 什么是"配置的建筑"？

配置的建筑是指在 `public/config/scene_aaa.json` 文件中定义的建筑，这些建筑有：
- 黄色标记点（buildingMarker）
- 透明圆柱体点击区域（cylinderBuilding）
- 单体化高亮配置

## 什么是"其他建筑"？

其他建筑是指 3D Tiles 模型中存在，但没有在配置文件中定义的建筑部分。点击这些区域会：
- 触发点击事件
- 清除已有的高亮
- 不会创建新的高亮（因为没有配置）

## 代码位置
- **文件**: `src/components/CesiumViewerSDK.vue`
- **函数**: `handleClick()` (第 110-210 行)

## 核心逻辑

```typescript
// 标记是否点击了配置的建筑
let isConfiguredBuilding = false

// 检查是否是配置的建筑实体
if (pickedObject.id && pickedObject.id.name) {
  try {
    const modelData = JSON.parse(pickedObject.id.name)
    if (modelData.cesiumType === 'buildingMarker' || 
        modelData.cesiumType === 'cylinderBuilding') {
      isConfiguredBuilding = true
      // 处理配置建筑的点击...
    }
  } catch (error) {
    // 不是配置的建筑实体
  }
}

// 如果点击的不是配置的建筑
if (!isConfiguredBuilding) {
  // 清除所有高亮
  sdk.clearAllHighlights()
  // 隐藏所有信息
}
```

## 相关文档
- `CLICK_INTERACTION_FIX.md` - 详细的修复说明
- `CUSTOM_CLICK_EVENT_GUIDE.md` - 自定义点击事件指南
- `ENTITY_TYPE_EXPLANATION.md` - 实体类型说明
