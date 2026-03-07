# 默认高亮控制说明

## 🎯 当前行为

**AAA 模型默认会自动高亮整个模型**

原因：
1. 页面加载后延迟 2 秒
2. 自动高亮第一个楼栋（`aaa_building1`）
3. 由于配置使用自动检测模式，会高亮整个模型
4. 同时显示楼栋信息

---

## 📝 代码位置

**文件**: `src/components/CesiumViewerSDK.vue`  
**行数**: 263-277

```typescript
// 延迟显示默认高亮
setTimeout(async () => {
  if (!sdk) return
  
  try {
    const scene = sdk.getCurrentScene()
    if (scene && scene.buildings && scene.buildings.length > 0) {
      const firstBuilding = scene.buildings[0]  // 第一个楼栋
      if (firstBuilding) {
        await sdk.createHighlight(firstBuilding.id)  // 创建高亮
        sdk.showBuildingInfo(firstBuilding.id)       // 显示信息
      }
    }
  } catch (error) {
    console.error('❌ 创建默认高亮失败:', error)
  }
}, 2000)  // 延迟 2 秒
```

---

## 🎨 选项 1: 禁用默认高亮（已实现）✅

**效果**: 页面加载后不会自动高亮，需要手动点击模型才会高亮

**修改**: 已注释掉默认高亮代码

**适用场景**:
- 想要干净的初始视图
- 让用户主动点击选择
- 避免自动高亮干扰

**测试**:
```bash
npm run dev
```

打开浏览器，应该看到：
- ✅ 模型正常显示
- ✅ 没有默认高亮
- ✅ 点击模型才会高亮

---

## 🎨 选项 2: 保留默认高亮

如果你想要保留默认高亮，取消注释代码：

```typescript
// 延迟显示默认高亮
setTimeout(async () => {
  if (!sdk) return
  
  try {
    const scene = sdk.getCurrentScene()
    if (scene && scene.buildings && scene.buildings.length > 0) {
      const firstBuilding = scene.buildings[0]
      if (firstBuilding) {
        await sdk.createHighlight(firstBuilding.id)
        sdk.showBuildingInfo(firstBuilding.id)
      }
    }
  } catch (error) {
    console.error('❌ 创建默认高亮失败:', error)
  }
}, 2000)
```

**适用场景**:
- 展示效果
- 引导用户注意
- 默认选中某个楼栋

---

## 🎨 选项 3: 配置多个楼栋

如果 AAA 模型包含多个楼栋，可以在配置文件中添加多个楼栋：

**文件**: `public/config/scene_aaa.json`

```json
{
  "id": "aaa_project",
  "name": "AAA 项目",
  "buildings": [
    {
      "id": "aaa_building1",
      "name": "AAA-1号楼",
      "tilesetUrl": "/aaa/3dtiles/tileset.json",
      "monomerization": {
        "manual": {
          "center": { "x": 0, "y": 0, "z": 0 },
          "dimensions": { "length": 60, "width": 50, "height": 150 },
          "rotation": { "heading": 0, "pitch": 0, "roll": 0 },
          "offset": { "x": 0, "y": 0, "z": 0 }
        },
        "style": { "color": "#3498db", "alpha": 0.6 }
      },
      "marker": {
        "longitude": 113.06,
        "latitude": 22.64,
        "height": 100
      }
    },
    {
      "id": "aaa_building2",
      "name": "AAA-2号楼",
      "tilesetUrl": "/aaa/3dtiles/tileset.json",
      "monomerization": {
        "manual": {
          "center": { "x": 0, "y": 0, "z": 0 },
          "dimensions": { "length": 60, "width": 50, "height": 150 },
          "rotation": { "heading": 0, "pitch": 0, "roll": 0 },
          "offset": { "x": 100, "y": 0, "z": 0 }  // 偏移位置
        },
        "style": { "color": "#e74c3c", "alpha": 0.6 }
      },
      "marker": {
        "longitude": 113.061,
        "latitude": 22.64,
        "height": 100
      }
    }
  ]
}
```

这样就可以：
- 点击不同位置高亮不同楼栋
- 默认高亮第一个楼栋
- 切换高亮不同楼栋

---

## 🎨 选项 4: 自定义默认高亮

### 4.1 高亮特定楼栋

```typescript
// 高亮特定楼栋（而不是第一个）
setTimeout(async () => {
  if (!sdk) return
  await sdk.createHighlight('aaa_building2')  // 指定楼栋 ID
  sdk.showBuildingInfo('aaa_building2')
}, 2000)
```

### 4.2 高亮所有楼栋

```typescript
// 高亮所有楼栋
setTimeout(async () => {
  if (!sdk) return
  await sdk.createAllHighlights()  // 高亮所有
}, 2000)
```

### 4.3 调整延迟时间

```typescript
// 立即高亮（不延迟）
setTimeout(async () => {
  // ...
}, 0)

// 延迟 5 秒
setTimeout(async () => {
  // ...
}, 5000)
```

### 4.4 不显示信息标签

```typescript
// 只高亮，不显示信息
setTimeout(async () => {
  if (!sdk) return
  await sdk.createHighlight('aaa_building1')
  // sdk.showBuildingInfo('aaa_building1')  // 注释掉这行
}, 2000)
```

---

## 🔧 手动控制高亮

### 在控制台手动测试

```javascript
// 创建高亮
await sdk.createHighlight('aaa_building1')

// 显示信息
sdk.showBuildingInfo('aaa_building1')

// 清除高亮
sdk.clearAllHighlights()

// 隐藏信息
sdk.hideBuildingInfo('aaa_building1')
```

### 添加按钮控制

在 `CesiumViewerSDK.vue` 中添加按钮：

```vue
<template>
  <div class="cesium-container">
    <div id="cesiumContainer" class="cesium-viewer"></div>
    
    <!-- 控制按钮 -->
    <div class="control-panel">
      <button @click="highlightBuilding">高亮楼栋</button>
      <button @click="clearHighlight">清除高亮</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// ... 现有代码

const highlightBuilding = async () => {
  if (!sdk) return
  await sdk.createHighlight('aaa_building1')
  sdk.showBuildingInfo('aaa_building1')
}

const clearHighlight = () => {
  if (!sdk) return
  sdk.clearAllHighlights()
  sdk.hideBuildingInfo('aaa_building1')
}
</script>

<style scoped>
.control-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.control-panel button {
  margin: 5px;
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.control-panel button:hover {
  background: #2980b9;
}
</style>
```

---

## 📊 对比

| 选项 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| 禁用默认高亮 | 干净的初始视图 | 需要用户主动点击 | 交互式应用 |
| 保留默认高亮 | 引导用户注意 | 可能干扰视图 | 展示/演示 |
| 多个楼栋 | 可以分别高亮 | 需要配置坐标 | 复杂场景 |
| 自定义控制 | 灵活性高 | 需要额外代码 | 特殊需求 |

---

## 🎯 当前状态

✅ **已禁用默认高亮**

现在的行为：
- 页面加载后不会自动高亮
- 需要点击模型才会高亮
- 点击空白区域清除高亮

如果想要恢复默认高亮，取消注释 `src/components/CesiumViewerSDK.vue` 第 263-277 行的代码。

---

## 🚀 测试

### 1. 启动项目

```bash
npm run dev
```

### 2. 查看效果

打开浏览器，应该看到：
- ✅ 模型正常显示
- ✅ 没有默认高亮
- ✅ 点击模型会高亮

### 3. 手动测试

在控制台输入：

```javascript
// 手动创建高亮
await sdk.createHighlight('aaa_building1')

// 清除高亮
sdk.clearAllHighlights()
```

---

## 💡 建议

### 对于 AAA 模型

**推荐**: 禁用默认高亮（当前状态）✅

原因：
1. AAA 模型可能包含多个楼栋
2. 需要先配置好各个楼栋的坐标
3. 让用户主动点击选择更合适

### 对于保利模型

**推荐**: 保留默认高亮

原因：
1. 配置已经完善
2. 可以展示效果
3. 引导用户注意

---

**更新时间**: 2026-03-02  
**版本**: SDK v1.2  
**状态**: ✅ 已禁用默认高亮
