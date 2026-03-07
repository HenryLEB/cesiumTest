# 建筑点击事件逻辑说明

## 核心机制

是的，所有建筑的点击事件都写在同一个地方，通过 `buildingId` 来区分不同的建筑和执行不同的逻辑。

## 代码位置

**文件**: `src/components/CesiumViewerSDK.vue`  
**函数**: `handleClick()` (第 110-193 行)

## 工作流程

### 1. 点击检测
```typescript
const pickedObject = viewer.value.scene.pick(click.position)
```
检测用户点击的是什么对象。

### 2. 解析建筑 ID
```typescript
const modelData = JSON.parse(pickedObject.id.name)
const buildingId = modelData.buildingId  // 例如: "B1", "B2", "AAA"
```
从实体的 `name` 属性中解析出 `buildingId`。

### 3. 根据 ID 执行逻辑
```typescript
// 通过 buildingId 区分不同建筑
console.log('🏢 点击的楼栋ID:', buildingId)

// 所有建筑共用相同的逻辑
sdk.createHighlight(buildingId)
sdk.showBuildingInfo(buildingId)
```

## 如何为不同建筑添加不同逻辑

### 方式 1: 在统一的点击处理函数中使用 if/switch

```typescript
const buildingId = modelData.buildingId

// 方式 1: 使用 if 语句
if (buildingId === 'B1') {
  // B1 的特殊逻辑
  console.log('这是 B1 楼')
  sdk.createHighlight(buildingId)
  // B1 特有的操作...
} else if (buildingId === 'B2') {
  // B2 的特殊逻辑
  console.log('这是 B2 楼')
  sdk.createHighlight(buildingId)
  // B2 特有的操作...
} else {
  // 其他建筑的通用逻辑
  sdk.createHighlight(buildingId)
  sdk.showBuildingInfo(buildingId)
}

// 方式 2: 使用 switch 语句
switch (buildingId) {
  case 'B1':
    // B1 的逻辑
    handleB1Click()
    break
  case 'B2':
    // B2 的逻辑
    handleB2Click()
    break
  case 'AAA':
    // AAA 的逻辑
    handleAAAClick()
    break
  default:
    // 默认逻辑
    handleDefaultClick(buildingId)
}
```

### 方式 2: 使用配置驱动的方式

```typescript
// 定义建筑点击行为配置
const buildingClickHandlers = {
  'B1': (id: string) => {
    console.log('B1 被点击')
    sdk.createHighlight(id)
    sdk.showBuildingInfo(id)
    // B1 特有逻辑
    alert('欢迎来到 B1 楼！')
  },
  'B2': (id: string) => {
    console.log('B2 被点击')
    sdk.createHighlight(id)
    // B2 特有逻辑
    window.open('/b2-details.html')
  },
  'AAA': (id: string) => {
    console.log('AAA 被点击')
    sdk.createHighlight(id)
    // AAA 特有逻辑
    fetch('/api/building/aaa').then(res => res.json())
  }
}

// 在点击处理中使用
const buildingId = modelData.buildingId
const handler = buildingClickHandlers[buildingId]

if (handler) {
  handler(buildingId)
} else {
  // 默认行为
  sdk.createHighlight(buildingId)
  sdk.showBuildingInfo(buildingId)
}
```

### 方式 3: 从配置文件读取行为

在 `public/config/scene_aaa.json` 中添加点击行为配置：

```json
{
  "buildings": [
    {
      "id": "B1",
      "name": "B1 楼",
      "onClick": {
        "type": "highlight",
        "showInfo": true,
        "customAction": "openDialog"
      }
    },
    {
      "id": "B2",
      "name": "B2 楼",
      "onClick": {
        "type": "highlight",
        "showInfo": true,
        "customAction": "openUrl",
        "url": "/b2-details.html"
      }
    }
  ]
}
```

然后在代码中读取配置：

```typescript
const buildingId = modelData.buildingId
const scene = sdk.getCurrentScene()
const building = scene?.buildings.find(b => b.id === buildingId)

if (building?.onClick) {
  // 根据配置执行不同的行为
  if (building.onClick.type === 'highlight') {
    sdk.createHighlight(buildingId)
  }
  
  if (building.onClick.showInfo) {
    sdk.showBuildingInfo(buildingId)
  }
  
  if (building.onClick.customAction === 'openDialog') {
    openCustomDialog(building)
  } else if (building.onClick.customAction === 'openUrl') {
    window.open(building.onClick.url)
  }
}
```

## 当前实现的统一逻辑

目前所有建筑使用相同的点击逻辑：

```typescript
const buildingId = modelData.buildingId  // 获取建筑 ID

// 检查是否已高亮
const existingHighlight = sdk.getHighlight(buildingId)

if (existingHighlight) {
  // 已高亮 → 取消高亮
  sdk.clearHighlight(buildingId)
  sdk.hideBuildingInfo(buildingId)
} else {
  // 未高亮 → 创建高亮
  sdk.clearAllHighlights()
  sdk.createHighlight(buildingId)
  sdk.showBuildingInfo(buildingId)
}
```

## 实际示例

### 示例 1: 为 B1 添加特殊弹窗

```typescript
const buildingId = modelData.buildingId

if (buildingId === 'B1') {
  // B1 特殊逻辑
  sdk.createHighlight(buildingId)
  alert('B1 楼：办公楼，共 20 层')
} else {
  // 其他建筑通用逻辑
  sdk.createHighlight(buildingId)
  sdk.showBuildingInfo(buildingId)
}
```

### 示例 2: 为 AAA 添加 HTTP 请求

```typescript
const buildingId = modelData.buildingId

sdk.createHighlight(buildingId)

if (buildingId === 'AAA') {
  // AAA 特殊逻辑：请求详细信息
  fetch(`/api/building/${buildingId}`)
    .then(res => res.json())
    .then(data => {
      console.log('AAA 详细信息:', data)
      // 显示自定义信息
      showCustomInfo(data)
    })
} else {
  // 其他建筑显示默认信息
  sdk.showBuildingInfo(buildingId)
}
```

### 示例 3: 根据建筑类型执行不同逻辑

```typescript
const buildingId = modelData.buildingId
const scene = sdk.getCurrentScene()
const building = scene?.buildings.find(b => b.id === buildingId)

// 假设配置中有 type 字段
if (building?.type === 'office') {
  // 办公楼逻辑
  sdk.createHighlight(buildingId)
  showOfficeInfo(building)
} else if (building?.type === 'residential') {
  // 住宅楼逻辑
  sdk.createHighlight(buildingId)
  showResidentialInfo(building)
} else {
  // 默认逻辑
  sdk.createHighlight(buildingId)
  sdk.showBuildingInfo(buildingId)
}
```

## 建筑 ID 的来源

建筑 ID 来自配置文件 `public/config/scene_aaa.json`：

```json
{
  "buildings": [
    {
      "id": "AAA",           // ← 这就是 buildingId
      "name": "AAA 建筑",
      "marker": { ... },
      "monomerization": { ... }
    }
  ]
}
```

## 数据流程

```
配置文件 (scene_aaa.json)
  ↓
  buildings: [{ id: "AAA", ... }]
  ↓
SDK 加载配置
  ↓
创建标记和圆柱体实体
  ↓
实体 name 属性: { cesiumType: "buildingMarker", buildingId: "AAA" }
  ↓
用户点击
  ↓
解析 name 属性获取 buildingId
  ↓
根据 buildingId 执行对应逻辑
```

## 优势

1. **集中管理**: 所有点击逻辑在一个地方，易于维护
2. **灵活扩展**: 通过 buildingId 可以轻松添加特殊逻辑
3. **配置驱动**: 可以从配置文件读取行为，无需修改代码
4. **类型安全**: TypeScript 提供类型检查

## 相关文档

- `CUSTOM_CLICK_EVENT_GUIDE.md` - 自定义点击事件详细指南
- `ENTITY_TYPE_EXPLANATION.md` - 实体类型和 ID 说明
- `CLICK_INTERACTION_FIX.md` - 点击交互修复说明
- `public/config/scene_aaa.json` - 建筑配置文件

## 总结

✅ 所有建筑的点击事件都在 `handleClick()` 函数中统一处理  
✅ 通过 `buildingId` 区分不同的建筑  
✅ 可以使用 if/switch 或配置驱动的方式为不同建筑添加不同逻辑  
✅ 当前实现是统一的高亮/取消高亮逻辑，适用于所有建筑
