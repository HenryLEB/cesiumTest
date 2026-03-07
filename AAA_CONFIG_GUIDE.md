# AAA 模型单体化配置指南

## 📋 当前状态

✅ 已完成：
- 创建配置文件：`public/config/scene_aaa.json`
- 切换到 AAA 模型：修改了 `src/components/CesiumViewerSDK.vue`
- 3D Tiles 路径：`/aaa/3dtiles/tileset.json`

⏳ 待完成：
- 获取模型的准确坐标
- 配置单体化参数
- 测试高亮效果

---

## 🚀 步骤 1: 启动项目并查看模型

### 1.1 启动开发服务器

```bash
npm run dev
```

### 1.2 打开浏览器

访问：http://localhost:5173

### 1.3 打开浏览器控制台

按 `F12` 或右键 → 检查 → Console

---

## 🔍 步骤 2: 获取模型信息

### 2.1 查看 Tileset 信息

在控制台输入：

```javascript
// 获取 Tileset
const tileset = viewer.scene.primitives.get(0)

// 查看边界球信息
console.log('边界球中心:', tileset.boundingSphere.center)
console.log('边界球半径:', tileset.boundingSphere.radius)

// 转换为经纬度
const cartographic = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center)
const longitude = Cesium.Math.toDegrees(cartographic.longitude)
const latitude = Cesium.Math.toDegrees(cartographic.latitude)
const height = cartographic.height

console.log('经度:', longitude)
console.log('纬度:', latitude)
console.log('高度:', height)
```

**记录这些值**：
- 经度: _______________
- 纬度: _______________
- 高度: _______________

### 2.2 查看世界坐标

```javascript
// 查看世界坐标（用于单体化配置）
const center = tileset.boundingSphere.center
console.log('世界坐标 X:', center.x)
console.log('世界坐标 Y:', center.y)
console.log('世界坐标 Z:', center.z)
```

**记录这些值**：
- X: _______________
- Y: _______________
- Z: _______________

---

## 📍 步骤 3: 点击获取楼栋位置

### 3.1 启用点击坐标显示

在控制台输入：

```javascript
// 创建点击事件监听器
const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

handler.setInputAction((click) => {
  const pickPosition = viewer.scene.pickPosition(click.position)
  
  if (Cesium.defined(pickPosition)) {
    // 世界坐标
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎯 点击位置信息:')
    console.log('世界坐标 X:', pickPosition.x)
    console.log('世界坐标 Y:', pickPosition.y)
    console.log('世界坐标 Z:', pickPosition.z)
    
    // 经纬度坐标
    const cartographic = Cesium.Cartographic.fromCartesian(pickPosition)
    const longitude = Cesium.Math.toDegrees(cartographic.longitude)
    const latitude = Cesium.Math.toDegrees(cartographic.latitude)
    const height = cartographic.height
    
    console.log('经度:', longitude)
    console.log('纬度:', latitude)
    console.log('高度:', height)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK)

console.log('✅ 点击坐标显示已启用，点击模型查看坐标')
```

### 3.2 点击楼栋获取坐标

1. 点击你想要配置的楼栋
2. 在控制台查看输出的坐标
3. 记录下来

**楼栋 1 坐标**：
- 世界坐标 X: _______________
- 世界坐标 Y: _______________
- 世界坐标 Z: _______________
- 经度: _______________
- 纬度: _______________
- 高度: _______________

**楼栋 2 坐标**（如果有）：
- 世界坐标 X: _______________
- 世界坐标 Y: _______________
- 世界坐标 Z: _______________
- 经度: _______________
- 纬度: _______________
- 高度: _______________

---

## 🎨 步骤 4: 测试自动检测模式

### 4.1 使用自动检测

当前配置已经使用自动检测模式，在控制台测试：

```javascript
// 创建高亮（自动检测模式）
await sdk.createHighlight('aaa_building1')
```

### 4.2 查看效果

- 如果高亮位置正确 → 继续使用自动检测 ✅
- 如果高亮位置不对 → 需要手动配置 ⚠️

### 4.3 清除高亮

```javascript
sdk.clearAllHighlights()
```

---

## ⚙️ 步骤 5: 手动配置（如果自动检测不准确）

### 5.1 编辑配置文件

打开 `public/config/scene_aaa.json`，修改为手动配置：

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
          "center": {
            "x": 0,  // ⭐ 填入步骤 3.2 记录的世界坐标 X
            "y": 0,  // ⭐ 填入步骤 3.2 记录的世界坐标 Y
            "z": 0   // ⭐ 填入步骤 3.2 记录的世界坐标 Z
          },
          "dimensions": {
            "length": 60,  // ⭐ 楼栋长度（需要调整）
            "width": 50,   // ⭐ 楼栋宽度（需要调整）
            "height": 150  // ⭐ 楼栋高度（需要调整）
          },
          "rotation": {
            "heading": 0,  // ⭐ 偏航角（需要调整）
            "pitch": 0,
            "roll": 0
          },
          "offset": {
            "x": 0,  // ⭐ X 轴偏移（需要调整）
            "y": 0,  // ⭐ Y 轴偏移（需要调整）
            "z": 0   // ⭐ Z 轴偏移（需要调整）
          }
        },
        "style": {
          "color": "#3498db",
          "alpha": 0.6
        }
      },
      "marker": {
        "longitude": 0,  // ⭐ 填入步骤 3.2 记录的经度
        "latitude": 0,   // ⭐ 填入步骤 3.2 记录的纬度
        "height": 100    // ⭐ 标记高度（可调整）
      },
      "info": {
        "name": "AAA-1号楼",
        "status": "已配置"
      }
    }
  ],
  "camera": {
    "longitude": 0,  // ⭐ 填入步骤 2.1 记录的经度
    "latitude": 0,   // ⭐ 填入步骤 2.1 记录的纬度
    "height": 1000,
    "heading": 0,
    "pitch": -90,
    "roll": 0
  }
}
```

### 5.2 重新加载配置

刷新浏览器页面（F5）

### 5.3 测试高亮

```javascript
await sdk.createHighlight('aaa_building1')
```

---

## 🔧 步骤 6: 调整参数

### 6.1 调整尺寸

如果高亮大小不对，修改 `dimensions`：

```json
"dimensions": {
  "length": 70,  // 增加/减少长度
  "width": 60,   // 增加/减少宽度
  "height": 180  // 增加/减少高度
}
```

### 6.2 调整旋转

如果高亮角度不对，修改 `rotation.heading`：

```json
"rotation": {
  "heading": 0.5,  // 尝试不同的值：0, 0.5, 1.0, 1.5 等
  "pitch": 0,
  "roll": 0
}
```

### 6.3 调整偏移

如果高亮位置偏移，修改 `offset`：

```json
"offset": {
  "x": 10,   // 正值向东，负值向西
  "y": -5,   // 正值向北，负值向南
  "z": 20    // 正值向上，负值向下
}
```

### 6.4 实时测试

每次修改后：
1. 保存文件
2. 刷新浏览器（F5）
3. 在控制台运行：`await sdk.createHighlight('aaa_building1')`
4. 查看效果

---

## 🎯 步骤 7: 使用调试工具

### 7.1 可视化调试

在控制台输入：

```javascript
// 显示边界球（红色）
viewer.entities.add({
  position: tileset.boundingSphere.center,
  ellipsoid: {
    radii: new Cesium.Cartesian3(
      tileset.boundingSphere.radius,
      tileset.boundingSphere.radius,
      tileset.boundingSphere.radius
    ),
    material: Cesium.Color.RED.withAlpha(0.3)
  }
})
```

### 7.2 显示中心点

```javascript
// 显示中心点（黄色）
viewer.entities.add({
  position: tileset.boundingSphere.center,
  point: {
    pixelSize: 20,
    color: Cesium.Color.YELLOW
  }
})
```

### 7.3 测试不同颜色

```javascript
// 测试不同颜色的高亮
sdk.clearAllHighlights()

// 修改配置中的颜色，然后重新创建
// 可选颜色：#3498db (蓝), #e74c3c (红), #2ecc71 (绿), #f39c12 (橙)
```

---

## 📊 步骤 8: 添加多个楼栋

### 8.1 复制配置

在 `scene_aaa.json` 中添加更多楼栋：

```json
{
  "buildings": [
    {
      "id": "aaa_building1",
      "name": "AAA-1号楼",
      // ... 第一个楼栋配置
    },
    {
      "id": "aaa_building2",
      "name": "AAA-2号楼",
      "tilesetUrl": "/aaa/3dtiles/tileset.json",
      "monomerization": {
        "manual": {
          "center": { "x": 0, "y": 0, "z": 0 },  // ⭐ 第二个楼栋的坐标
          "dimensions": { "length": 60, "width": 50, "height": 150 },
          "rotation": { "heading": 0, "pitch": 0, "roll": 0 },
          "offset": { "x": 0, "y": 0, "z": 0 }
        },
        "style": {
          "color": "#e74c3c",  // 不同的颜色
          "alpha": 0.6
        }
      },
      "marker": {
        "longitude": 0,
        "latitude": 0,
        "height": 100
      },
      "info": {
        "name": "AAA-2号楼"
      }
    }
  ]
}
```

### 8.2 测试多个楼栋

```javascript
// 测试第一个楼栋
await sdk.createHighlight('aaa_building1')

// 清除
sdk.clearAllHighlights()

// 测试第二个楼栋
await sdk.createHighlight('aaa_building2')
```

---

## 🎨 步骤 9: 优化标记位置

### 9.1 调整标记高度

修改 `marker.height`，使黄色标记显示在合适的位置：

```json
"marker": {
  "longitude": 113.06,
  "latitude": 22.64,
  "height": 85  // ⭐ 调整这个值，通常是楼栋高度的一半
}
```

### 9.2 测试标记

刷新页面后，查看黄色标记是否在楼栋上方合适的位置。

---

## ✅ 步骤 10: 验证完整功能

### 10.1 功能检查清单

- [ ] 模型正确加载
- [ ] 点击楼栋可以高亮
- [ ] 高亮位置准确
- [ ] 高亮大小合适
- [ ] 黄色标记显示正确
- [ ] 点击标记可以高亮
- [ ] 点击空白可以清除高亮
- [ ] 楼栋信息显示正确

### 10.2 最终测试

```javascript
// 1. 创建高亮
await sdk.createHighlight('aaa_building1')

// 2. 显示信息
sdk.showBuildingInfo('aaa_building1')

// 3. 查看当前场景
const scene = sdk.getCurrentScene()
console.log('场景名称:', scene.name)
console.log('楼栋数量:', scene.buildings.length)

// 4. 清除高亮
sdk.clearAllHighlights()
```

---

## 🔄 步骤 11: 切换回原来的模型

### 11.1 修改代码

编辑 `src/components/CesiumViewerSDK.vue`：

```typescript
// 切换回保利项目
await sdk.loadSceneFromFile('/config/scene.json')

// 或保持 AAA 项目
await sdk.loadSceneFromFile('/config/scene_aaa.json')
```

### 11.2 重启开发服务器

```bash
# Ctrl+C 停止
npm run dev
```

---

## 📝 常用调试命令

### 查看信息

```javascript
// 查看 SDK
window.sdk

// 查看 Viewer
window.viewer

// 查看当前场景
sdk.getCurrentScene()

// 查看所有高亮
sdk.getAllHighlights()
```

### 操作命令

```javascript
// 创建高亮
await sdk.createHighlight('aaa_building1')

// 清除高亮
sdk.clearAllHighlights()

// 显示信息
sdk.showBuildingInfo('aaa_building1')

// 隐藏信息
sdk.hideBuildingInfo('aaa_building1')

// 重置视图
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(113.06, 22.64, 1000),
  orientation: {
    heading: 0,
    pitch: Cesium.Math.toRadians(-90),
    roll: 0
  }
})
```

### 清理命令

```javascript
// 移除所有实体
viewer.entities.removeAll()

// 移除所有图元
viewer.scene.primitives.removeAll()

// 重新加载场景
await sdk.loadSceneFromFile('/config/scene_aaa.json')
```

---

## 💡 调试技巧

### 技巧 1: 快速定位

```javascript
// 飞到模型位置
const tileset = viewer.scene.primitives.get(0)
viewer.zoomTo(tileset)
```

### 技巧 2: 对比参数

```javascript
// 保存当前配置
const config1 = {
  center: { x: -2306928.47, y: 5418717.87, z: 2440505.74 },
  dimensions: { length: 65, width: 50, height: 160 }
}

// 测试新配置
const config2 = {
  center: { x: -2306930.0, y: 5418720.0, z: 2440500.0 },
  dimensions: { length: 70, width: 60, height: 180 }
}

// 对比差异
console.log('X 差异:', config2.center.x - config1.center.x)
console.log('Y 差异:', config2.center.y - config1.center.y)
console.log('Z 差异:', config2.center.z - config1.center.z)
```

### 技巧 3: 批量测试

```javascript
// 测试不同的 heading 值
for (let heading = 0; heading <= 2; heading += 0.2) {
  console.log(`测试 heading: ${heading}`)
  // 修改配置，刷新页面，查看效果
}
```

---

## 📋 配置模板

### 最小配置（自动检测）

```json
{
  "id": "building_id",
  "name": "楼栋名称",
  "tilesetUrl": "/path/to/tileset.json",
  "monomerization": {
    "autoDetect": true,
    "style": { "color": "#3498db", "alpha": 0.6 }
  },
  "marker": {
    "longitude": 113.06,
    "latitude": 22.64,
    "height": 100
  }
}
```

### 完整配置（手动）

```json
{
  "id": "building_id",
  "name": "楼栋名称",
  "tilesetUrl": "/path/to/tileset.json",
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
  },
  "info": {
    "name": "楼栋名称",
    "floors": "20层",
    "area": "10000㎡"
  }
}
```

---

## 🎉 完成

配置完成后，你应该能够：
- ✅ 看到 AAA 模型正确加载
- ✅ 点击楼栋显示准确的高亮
- ✅ 黄色标记显示在正确位置
- ✅ 楼栋信息正确显示

如果遇到问题，请参考上面的调试命令和技巧！

---

**创建时间**: 2026-03-02  
**版本**: v1.0
