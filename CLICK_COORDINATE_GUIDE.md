# 点击坐标配置指南

## ✅ 已添加点击坐标日志

现在点击模型时，控制台会自动显示详细的坐标信息，方便你直接复制到配置文件中！

---

## 🚀 使用步骤

### 步骤 1: 启动项目

```bash
npm run dev
```

### 步骤 2: 打开浏览器

访问：http://localhost:5173  
按 `F12` 打开控制台

### 步骤 3: 点击模型

点击你想要配置的楼栋位置，控制台会显示：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 点击位置坐标信息:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 世界坐标 (用于 monomerization.manual.center):
  X: -2306928.4726084634
  Y: 5418717.874638036
  Z: 2440505.7478268957

🌍 经纬度坐标 (用于 marker):
  经度 (longitude): 113.06090721905448
  纬度 (latitude): 22.645399902809583
  高度 (height): 85.12345

📋 配置文件格式 (复制使用):
  "center": {
    "x": -2306928.4726084634,
    "y": 5418717.874638036,
    "z": 2440505.7478268957
  },
  "marker": {
    "longitude": 113.06090721905448,
    "latitude": 22.645399902809583,
    "height": 85
  }
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 步骤 4: 复制坐标

直接复制 "📋 配置文件格式" 部分的内容！

### 步骤 5: 编辑配置文件

打开 `public/config/scene_aaa.json`，粘贴坐标：

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
            "x": -2306928.4726084634,  // ⭐ 粘贴这里
            "y": 5418717.874638036,
            "z": 2440505.7478268957
          },
          "dimensions": {
            "length": 60,  // ⭐ 需要调整
            "width": 50,   // ⭐ 需要调整
            "height": 150  // ⭐ 需要调整
          },
          "rotation": {
            "heading": 0,  // ⭐ 需要调整
            "pitch": 0,
            "roll": 0
          },
          "offset": {
            "x": 0,  // ⭐ 需要调整
            "y": 0,
            "z": 0
          }
        },
        "style": {
          "color": "#3498db",
          "alpha": 0.6
        }
      },
      "marker": {
        "longitude": 113.06090721905448,  // ⭐ 粘贴这里
        "latitude": 22.645399902809583,
        "height": 85
      },
      "info": {
        "name": "AAA-1号楼",
        "status": "已配置"
      }
    }
  ]
}
```

### 步骤 6: 测试高亮

保存配置文件，刷新浏览器（F5），在控制台输入：

```javascript
await sdk.createHighlight('aaa_building1')
```

### 步骤 7: 调整参数

如果高亮位置不对，调整以下参数：

#### 调整尺寸 (dimensions)
```json
"dimensions": {
  "length": 70,  // 增加/减少长度
  "width": 60,   // 增加/减少宽度
  "height": 180  // 增加/减少高度
}
```

#### 调整旋转 (rotation.heading)
```json
"rotation": {
  "heading": 0.5,  // 尝试：0, 0.5, 1.0, 1.5, 2.0
  "pitch": 0,
  "roll": 0
}
```

#### 调整偏移 (offset)
```json
"offset": {
  "x": 10,   // 正值向东，负值向西
  "y": -5,   // 正值向北，负值向南
  "z": 20    // 正值向上，负值向下
}
```

---

## 📍 坐标说明

### 世界坐标 (X, Y, Z)
- 用于：`monomerization.manual.center`
- 说明：Cesium 的世界坐标系统
- 单位：米
- 用途：定位高亮盒子的中心点

### 经纬度坐标 (longitude, latitude, height)
- 用于：`marker`
- 说明：地理坐标系统
- 单位：度（经纬度）、米（高度）
- 用途：定位黄色标记的位置

---

## 🎯 配置多个楼栋

### 方法 1: 点击不同位置

1. 点击第一个楼栋 → 复制坐标 → 配置 building1
2. 点击第二个楼栋 → 复制坐标 → 配置 building2
3. 点击第三个楼栋 → 复制坐标 → 配置 building3

### 方法 2: 复制配置模板

```json
{
  "buildings": [
    {
      "id": "aaa_building1",
      "name": "AAA-1号楼",
      "tilesetUrl": "/aaa/3dtiles/tileset.json",
      "monomerization": {
        "manual": {
          "center": { "x": 0, "y": 0, "z": 0 },  // ⭐ 点击获取
          "dimensions": { "length": 60, "width": 50, "height": 150 },
          "rotation": { "heading": 0, "pitch": 0, "roll": 0 },
          "offset": { "x": 0, "y": 0, "z": 0 }
        },
        "style": { "color": "#3498db", "alpha": 0.6 }
      },
      "marker": {
        "longitude": 0,  // ⭐ 点击获取
        "latitude": 0,
        "height": 100
      },
      "info": { "name": "AAA-1号楼" }
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
        "height": 100
      },
      "info": { "name": "AAA-2号楼" }
    }
  ]
}
```

---

## 🔧 开发工具

### 全局变量

在控制台中可以使用：

```javascript
// SDK 实例
window.sdk

// Viewer 实例
window.viewer
```

### 常用命令

```javascript
// 创建高亮
await sdk.createHighlight('aaa_building1')

// 清除高亮
sdk.clearAllHighlights()

// 查看当前场景
sdk.getCurrentScene()

// 查看所有高亮
sdk.getAllHighlights()
```

### 获取模型信息

```javascript
// 获取 Tileset
const tileset = viewer.scene.primitives.get(0)

// 查看边界球
console.log('中心:', tileset.boundingSphere.center)
console.log('半径:', tileset.boundingSphere.radius)

// 转换为经纬度
const cartographic = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center)
console.log('经度:', Cesium.Math.toDegrees(cartographic.longitude))
console.log('纬度:', Cesium.Math.toDegrees(cartographic.latitude))
```

---

## 💡 调试技巧

### 技巧 1: 多点击几次

点击楼栋的不同位置，取平均值或中心位置的坐标。

### 技巧 2: 使用自动检测

如果手动配置太复杂，可以先用自动检测：

```json
"monomerization": {
  "autoDetect": true,
  "style": { "color": "#3498db", "alpha": 0.6 }
}
```

### 技巧 3: 对比保利项目

参考 `public/config/scene.json` 中保利项目的配置。

### 技巧 4: 小步调整

每次只调整一个参数，方便定位问题：
1. 先调整 center（中心点）
2. 再调整 dimensions（尺寸）
3. 然后调整 rotation（旋转）
4. 最后调整 offset（偏移）

### 技巧 5: 可视化调试

在控制台添加可视化标记：

```javascript
// 显示中心点
viewer.entities.add({
  position: Cesium.Cartesian3.fromElements(-2306928.47, 5418717.87, 2440505.74),
  point: {
    pixelSize: 20,
    color: Cesium.Color.YELLOW
  }
})

// 显示边界球
const tileset = viewer.scene.primitives.get(0)
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

---

## 📋 配置检查清单

配置完成后，检查以下项目：

- [ ] 点击模型获取了坐标
- [ ] 复制坐标到配置文件
- [ ] 保存配置文件
- [ ] 刷新浏览器
- [ ] 测试高亮效果
- [ ] 高亮位置正确
- [ ] 高亮大小合适
- [ ] 黄色标记显示正确
- [ ] 点击标记可以高亮
- [ ] 楼栋信息显示正确

---

## 🎉 示例输出

当你点击模型时，控制台会显示类似这样的信息：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 点击位置坐标信息:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 世界坐标 (用于 monomerization.manual.center):
  X: -2306928.4726084634
  Y: 5418717.874638036
  Z: 2440505.7478268957

🌍 经纬度坐标 (用于 marker):
  经度 (longitude): 113.06090721905448
  纬度 (latitude): 22.645399902809583
  高度 (height): 85.12345

📋 配置文件格式 (复制使用):
  "center": {
    "x": -2306928.4726084634,
    "y": 5418717.874638036,
    "z": 2440505.7478268957
  },
  "marker": {
    "longitude": 113.06090721905448,
    "latitude": 22.645399902809583,
    "height": 85
  }
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 点击到了物体
```

直接复制 "📋 配置文件格式" 部分即可！

---

## 🚀 开始配置

1. 运行 `npm run dev`
2. 打开浏览器和控制台
3. 点击模型
4. 复制坐标
5. 编辑配置文件
6. 测试效果

就这么简单！🎉

---

**更新时间**: 2026-03-02  
**版本**: SDK v1.2  
**状态**: ✅ 点击坐标日志已启用
