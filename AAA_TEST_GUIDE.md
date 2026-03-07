# AAA 模型测试指南

## ✅ 配置已完成

已将你点击的坐标配置到 `public/config/scene_aaa.json`

---

## 📋 当前配置

### 楼栋信息
- **ID**: `aaa_building1`
- **名称**: AAA-1号楼

### 中心点坐标
```json
"center": {
  "x": -1956535.307779435,
  "y": 4458537.970092707,
  "z": 4107633.2496366594
}
```

### 标记位置
```json
"marker": {
  "longitude": 113.69325445193391,
  "latitude": 40.34206751103671,
  "height": 965
}
```

### 相机位置
```json
"camera": {
  "longitude": 113.69325445193391,
  "latitude": 40.34206751103671,
  "height": 2000,
  "heading": 0,
  "pitch": -90,
  "roll": 0
}
```

### 初始尺寸（需要调整）
```json
"dimensions": {
  "length": 60,  // 长度
  "width": 50,   // 宽度
  "height": 150  // 高度
}
```

---

## 🚀 测试步骤

### 步骤 1: 刷新浏览器

按 `F5` 刷新页面，加载新配置

### 步骤 2: 测试高亮

在控制台输入：

```javascript
// 创建高亮
await sdk.createHighlight('aaa_building1')
```

### 步骤 3: 查看效果

观察高亮是否正确：
- ✅ 高亮位置是否在楼栋上
- ✅ 高亮大小是否合适
- ✅ 高亮角度是否正确

### 步骤 4: 清除高亮

```javascript
// 清除高亮
sdk.clearAllHighlights()
```

---

## 🔧 调整参数

如果高亮不准确，需要调整以下参数：

### 调整 1: 尺寸 (dimensions)

**问题**: 高亮太大或太小

**解决**: 修改 `dimensions`

```json
"dimensions": {
  "length": 70,  // 增加长度
  "width": 60,   // 增加宽度
  "height": 180  // 增加高度
}
```

**测试**:
1. 保存文件
2. 刷新浏览器（F5）
3. 运行 `await sdk.createHighlight('aaa_building1')`

---

### 调整 2: 旋转 (rotation.heading)

**问题**: 高亮角度不对

**解决**: 修改 `rotation.heading`

```json
"rotation": {
  "heading": 0.5,  // 尝试不同的值：0, 0.5, 1.0, 1.5, 2.0
  "pitch": 0,
  "roll": 0
}
```

**参考值**:
- `0` = 0度（正北）
- `0.785` = 45度
- `1.57` = 90度（正东）
- `3.14` = 180度（正南）
- `4.71` = 270度（正西）

**测试**:
1. 保存文件
2. 刷新浏览器（F5）
3. 运行 `await sdk.createHighlight('aaa_building1')`

---

### 调整 3: 偏移 (offset)

**问题**: 高亮位置偏移

**解决**: 修改 `offset`

```json
"offset": {
  "x": 10,   // 正值向东，负值向西
  "y": -5,   // 正值向北，负值向南
  "z": 20    // 正值向上，负值向下
}
```

**测试**:
1. 保存文件
2. 刷新浏览器（F5）
3. 运行 `await sdk.createHighlight('aaa_building1')`

---

### 调整 4: 中心点 (center)

**问题**: 高亮位置完全不对

**解决**: 重新点击楼栋获取新的中心点坐标

1. 点击楼栋的中心位置
2. 复制新的坐标
3. 更新 `center`

---

## 🎨 调整流程

### 推荐顺序

1. **先调整尺寸** (dimensions)
   - 让高亮盒子大小合适

2. **再调整旋转** (rotation.heading)
   - 让高亮盒子角度正确

3. **然后调整偏移** (offset)
   - 微调高亮盒子位置

4. **最后调整中心点** (center)
   - 如果前面都不行，重新获取中心点

### 小步调整

每次只调整一个参数，例如：

```json
// 第 1 次测试：调整长度
"dimensions": { "length": 70, "width": 50, "height": 150 }

// 第 2 次测试：调整宽度
"dimensions": { "length": 70, "width": 60, "height": 150 }

// 第 3 次测试：调整高度
"dimensions": { "length": 70, "width": 60, "height": 180 }
```

---

## 📍 参考：保利项目配置

可以参考保利项目的配置作为参考：

**文件**: `public/config/scene.json`

```json
{
  "id": "building1",
  "name": "A6栋",
  "monomerization": {
    "manual": {
      "center": {
        "x": -2306928.4726084634,
        "y": 5418717.874638036,
        "z": 2440505.7478268957
      },
      "dimensions": {
        "length": 65,
        "width": 50,
        "height": 160
      },
      "rotation": {
        "heading": 0.4,
        "pitch": 0,
        "roll": 0
      },
      "offset": {
        "x": -14,
        "y": 17,
        "z": 93.5
      }
    }
  }
}
```

---

## 🔍 调试命令

### 查看当前配置

```javascript
const scene = sdk.getCurrentScene()
console.log('当前场景:', scene)
console.log('楼栋配置:', scene.buildings[0])
```

### 查看高亮信息

```javascript
const highlight = sdk.getHighlight('aaa_building1')
console.log('高亮信息:', highlight)
```

### 可视化中心点

```javascript
// 显示中心点（黄色点）
viewer.entities.add({
  position: Cesium.Cartesian3.fromElements(
    -1956535.307779435,
    4458537.970092707,
    4107633.2496366594
  ),
  point: {
    pixelSize: 20,
    color: Cesium.Color.YELLOW
  }
})
```

### 清除可视化

```javascript
// 清除所有实体
viewer.entities.removeAll()
```

---

## 📊 测试检查清单

- [ ] 刷新浏览器加载新配置
- [ ] 运行 `await sdk.createHighlight('aaa_building1')`
- [ ] 高亮位置正确
- [ ] 高亮大小合适
- [ ] 高亮角度正确
- [ ] 黄色标记显示在楼栋上方
- [ ] 点击黄色标记可以高亮
- [ ] 点击空白区域清除高亮
- [ ] 楼栋信息显示正确

---

## 🎯 常见问题

### Q1: 高亮太大了

**A**: 减小 `dimensions` 的值

```json
"dimensions": {
  "length": 40,  // 减小
  "width": 30,   // 减小
  "height": 100  // 减小
}
```

### Q2: 高亮太小了

**A**: 增大 `dimensions` 的值

```json
"dimensions": {
  "length": 80,  // 增大
  "width": 70,   // 增大
  "height": 200  // 增大
}
```

### Q3: 高亮角度不对

**A**: 调整 `rotation.heading`

```json
"rotation": {
  "heading": 1.0,  // 尝试不同的值
  "pitch": 0,
  "roll": 0
}
```

### Q4: 高亮位置偏移

**A**: 调整 `offset`

```json
"offset": {
  "x": 20,   // 向东偏移 20 米
  "y": -10,  // 向南偏移 10 米
  "z": 50    // 向上偏移 50 米
}
```

### Q5: 黄色标记看不到

**A**: 调整 `marker.height`

```json
"marker": {
  "longitude": 113.69325445193391,
  "latitude": 40.34206751103671,
  "height": 1000  // 增加高度
}
```

---

## 💡 快速测试命令

复制以下命令到控制台快速测试：

```javascript
// 1. 创建高亮
await sdk.createHighlight('aaa_building1')

// 2. 显示信息
sdk.showBuildingInfo('aaa_building1')

// 3. 等待 3 秒
await new Promise(resolve => setTimeout(resolve, 3000))

// 4. 清除高亮
sdk.clearAllHighlights()

// 5. 隐藏信息
sdk.hideBuildingInfo('aaa_building1')
```

---

## 🎉 配置完成后

当高亮效果满意后，你可以：

### 1. 添加更多楼栋

点击其他楼栋，复制坐标，添加到配置文件：

```json
{
  "buildings": [
    {
      "id": "aaa_building1",
      "name": "AAA-1号楼",
      // ... 已配置
    },
    {
      "id": "aaa_building2",
      "name": "AAA-2号楼",
      "tilesetUrl": "/aaa/3dtiles/tileset.json",
      "monomerization": {
        "manual": {
          "center": { "x": 0, "y": 0, "z": 0 },  // ⭐ 点击获取
          "dimensions": { "length": 60, "width": 50, "height": 150 },
          "rotation": { "heading": 0, "pitch": 0, "roll": 0 },
          "offset": { "x": 0, "y": 0, "z": 0 }
        },
        "style": { "color": "#e74c3c", "alpha": 0.6 }  // 不同颜色
      },
      "marker": {
        "longitude": 0,  // ⭐ 点击获取
        "latitude": 0,
        "height": 965
      },
      "info": { "name": "AAA-2号楼" }
    }
  ]
}
```

### 2. 切换回保利项目

编辑 `src/components/CesiumViewerSDK.vue` 第 287 行：

```typescript
// 切换回保利项目
await sdk.loadSceneFromFile('/config/scene.json')
```

### 3. 启用默认高亮

如果想要页面加载时自动高亮，取消注释 `src/components/CesiumViewerSDK.vue` 第 293-307 行。

---

## 📚 相关文档

- `CLICK_COORDINATE_GUIDE.md` - 点击坐标指南
- `AAA_CONFIG_GUIDE.md` - AAA 配置详细指南
- `AAA_QUICK_START.md` - AAA 快速开始

---

**配置时间**: 2026-03-02  
**版本**: SDK v1.2  
**状态**: ✅ 已配置，待测试
