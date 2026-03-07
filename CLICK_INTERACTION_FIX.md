# 点击交互修复说明

## 问题描述
之前的点击交互逻辑不正确：
- 点击任何楼栋都会清除所有高亮并创建新高亮
- 无法通过再次点击同一楼栋来取消高亮
- 不符合预期的交互体验

## 修复内容

### 新的交互逻辑
1. **点击未高亮的楼栋** → 清除其他高亮 + 高亮当前楼栋 + 显示信息
2. **点击已高亮的楼栋** → 取消高亮 + 隐藏信息
3. **点击空白区域** → 清除所有高亮 + 隐藏所有信息

### 代码位置
- **文件**: `src/components/CesiumViewerSDK.vue`
- **函数**: `handleClick()` (第 110-193 行)

### 核心改动

```typescript
// 检查是否已经高亮
const existingHighlight = sdk.getHighlight(buildingId)

if (existingHighlight) {
  // 如果已经高亮，则取消高亮
  sdk.clearHighlight(buildingId)
  sdk.hideBuildingInfo(buildingId)
} else {
  // 如果未高亮，先清除其他高亮，再创建新高亮
  sdk.clearAllHighlights()
  // 隐藏所有信息...
  sdk.createHighlight(buildingId)
  sdk.showBuildingInfo(buildingId)
}
```

## 使用的 SDK 方法

### 1. `sdk.getHighlight(buildingId)`
- **功能**: 获取指定楼栋的高亮对象
- **返回**: 如果存在高亮返回 `MonomerizationResult`，否则返回 `null`
- **用途**: 判断楼栋是否已经高亮

### 2. `sdk.clearHighlight(buildingId)`
- **功能**: 清除指定楼栋的高亮
- **用途**: 取消单个楼栋的高亮状态

### 3. `sdk.clearAllHighlights()`
- **功能**: 清除所有楼栋的高亮
- **用途**: 切换高亮或点击空白区域时清除

### 4. `sdk.createHighlight(buildingId)`
- **功能**: 为指定楼栋创建高亮
- **用途**: 高亮选中的楼栋

### 5. `sdk.showBuildingInfo(buildingId)`
- **功能**: 显示楼栋信息标签
- **用途**: 显示选中楼栋的详细信息

### 6. `sdk.hideBuildingInfo(buildingId)`
- **功能**: 隐藏楼栋信息标签
- **用途**: 隐藏楼栋信息

## 测试场景

### 场景 1: 点击 B1
- **操作**: 点击 B1 楼栋
- **预期**: B1 高亮，显示 B1 信息

### 场景 2: 点击 B2
- **操作**: 在 B1 高亮的情况下点击 B2
- **预期**: B1 取消高亮，B2 高亮，显示 B2 信息

### 场景 3: 再次点击 B2
- **操作**: 在 B2 高亮的情况下再次点击 B2
- **预期**: B2 取消高亮，隐藏 B2 信息

### 场景 4: 点击空白区域
- **操作**: 在有高亮的情况下点击空白区域
- **预期**: 所有高亮取消，所有信息隐藏

## 控制台日志

点击交互会输出详细的日志信息：

```
✅ 点击到了物体
🏢 点击的楼栋ID: B1
🔄 切换高亮到: B1
✅ 高亮已创建: B1
```

或

```
✅ 点击到了物体
🏢 点击的楼栋ID: B1
🔄 取消高亮: B1
🗑️ 高亮已清除: B1
```

## 相关文件
- `src/components/CesiumViewerSDK.vue` - 点击事件处理
- `sdk/core/MonomerizationSDK.ts` - SDK 主类
- `sdk/core/HighlightManager.ts` - 高亮管理器
- `sdk/core/MarkerManager.ts` - 标记管理器

## 注意事项
1. 点击交互依赖于 `buildingMarker` 和 `cylinderBuilding` 实体
2. 实体的 `name` 属性包含 JSON 格式的元数据
3. 通过 `cesiumType` 和 `buildingId` 识别点击的对象
4. 所有交互都会触发相应的 SDK 事件

## 更新时间
2024-03-07
