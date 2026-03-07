# AAA 模型配置 - 快速开始

## ✅ 已完成的工作

1. ✅ 创建了 AAA 配置文件：`public/config/scene_aaa.json`
2. ✅ 切换到 AAA 模型：修改了 `src/components/CesiumViewerSDK.vue`
3. ✅ 构建通过，无错误
4. ✅ 创建了详细的配置指南：`AAA_CONFIG_GUIDE.md`

---

## 🚀 立即开始

### 1. 启动项目

```bash
npm run dev
```

### 2. 打开浏览器

访问：http://localhost:5173

按 `F12` 打开控制台

---

## 📍 快速获取坐标

### 方法 1: 查看模型中心

在控制台输入：

```javascript
const tileset = viewer.scene.primitives.get(0)
const center = tileset.boundingSphere.center
const cartographic = Cesium.Cartographic.fromCartesian(center)

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📍 模型中心坐标:')
console.log('世界坐标 X:', center.x)
console.log('世界坐标 Y:', center.y)
console.log('世界坐标 Z:', center.z)
console.log('经度:', Cesium.Math.toDegrees(cartographic.longitude))
console.log('纬度:', Cesium.Math.toDegrees(cartographic.latitude))
console.log('高度:', cartographic.height)
console.log('半径:', tileset.boundingSphere.radius)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
```

### 方法 2: 点击获取坐标

在控制台输入：

```javascript
const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
handler.setInputAction((click) => {
  const pickPosition = viewer.scene.pickPosition(click.position)
  if (Cesium.defined(pickPosition)) {
    const cartographic = Cesium.Cartographic.fromCartesian(pickPosition)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎯 点击位置:')
    console.log('世界坐标 X:', pickPosition.x)
    console.log('世界坐标 Y:', pickPosition.y)
    console.log('世界坐标 Z:', pickPosition.z)
    console.log('经度:', Cesium.Math.toDegrees(cartographic.longitude))
    console.log('纬度:', Cesium.Math.toDegrees(cartographic.latitude))
    console.log('高度:', cartographic.height)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK)
console.log('✅ 点击坐标显示已启用')
```

---

## ⚙️ 配置步骤

### 步骤 1: 记录坐标

使用上面的方法获取并记录：
- 世界坐标 (X, Y, Z)
- 经纬度 (longitude, latitude)
- 高度 (height)

### 步骤 2: 编辑配置文件

打开 `public/config/scene_aaa.json`

#### 选项 A: 使用自动检测（推荐先试试）

```json
{
  "id": "aaa_building1",
  "name": "AAA-1号楼",
  "tilesetUrl": "/aaa/3dtiles/tileset.json",
  "monomerization": {
    "autoDetect": true,  // ⭐ 自动检测
    "style": {
      "color": "#3498db",
      "alpha": 0.6
    }
  },
  "marker": {
    "longitude": 113.06,  // ⭐ 填入你的经度
    "latitude": 22.64,    // ⭐ 填入你的纬度
    "height": 100
  }
}
```

#### 选项 B: 手动配置（如果自动检测不准）

```json
{
  "id": "aaa_building1",
  "name": "AAA-1号楼",
  "tilesetUrl": "/aaa/3dtiles/tileset.json",
  "monomerization": {
    "manual": {
      "center": {
        "x": 0,  // ⭐ 填入世界坐标 X
        "y": 0,  // ⭐ 填入世界坐标 Y
        "z": 0   // ⭐ 填入世界坐标 Z
      },
      "dimensions": {
        "length": 60,  // ⭐ 楼栋长度
        "width": 50,   // ⭐ 楼栋宽度
        "height": 150  // ⭐ 楼栋高度
      },
      "rotation": {
        "heading": 0,  // ⭐ 旋转角度
        "pitch": 0,
        "roll": 0
      },
      "offset": {
        "x": 0,  // ⭐ X 偏移
        "y": 0,  // ⭐ Y 偏移
        "z": 0   // ⭐ Z 偏移
      }
    },
    "style": {
      "color": "#3498db",
      "alpha": 0.6
    }
  },
  "marker": {
    "longitude": 113.06,  // ⭐ 填入经度
    "latitude": 22.64,    // ⭐ 填入纬度
    "height": 100
  }
}
```

### 步骤 3: 测试高亮

保存配置文件后，刷新浏览器（F5），在控制台输入：

```javascript
// 测试高亮
await sdk.createHighlight('aaa_building1')

// 清除高亮
sdk.clearAllHighlights()
```

### 步骤 4: 调整参数

如果高亮位置不对，调整配置文件中的参数：
- `dimensions` - 调整大小
- `rotation.heading` - 调整角度
- `offset` - 调整位置

每次修改后：
1. 保存文件
2. 刷新浏览器（F5）
3. 运行 `await sdk.createHighlight('aaa_building1')`

---

## 🎨 常用颜色

```json
"color": "#3498db"  // 蓝色
"color": "#e74c3c"  // 红色
"color": "#2ecc71"  // 绿色
"color": "#f39c12"  // 橙色
"color": "#9b59b6"  // 紫色
"color": "#F26419"  // 橙红色（保利项目使用）
```

---

## 🔄 切换回保利项目

编辑 `src/components/CesiumViewerSDK.vue`，修改第 139 行：

```typescript
// 切换回保利项目
await sdk.loadSceneFromFile('/config/scene.json')

// 或继续使用 AAA 项目
await sdk.loadSceneFromFile('/config/scene_aaa.json')
```

---

## 📚 详细文档

- `AAA_CONFIG_GUIDE.md` - 完整的配置指南（包含所有调试命令）
- `SDK_USAGE_GUIDE.md` - SDK 使用指南
- `MULTI_SCENE_CONFIG_GUIDE.md` - 多场景配置指南

---

## 💡 提示

1. **先用自动检测**：大多数情况下自动检测就够用了
2. **记录坐标**：把获取的坐标记录下来，方便后续调整
3. **小步调整**：每次只调整一个参数，方便定位问题
4. **使用控制台**：控制台是你最好的调试工具

---

## 🎯 目标

配置完成后，你应该能够：
- ✅ 看到 AAA 模型正确加载
- ✅ 点击楼栋显示准确的高亮
- ✅ 黄色标记显示在正确位置
- ✅ 楼栋信息正确显示

---

**现在就开始吧！运行 `npm run dev` 🚀**
