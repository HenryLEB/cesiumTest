# 相机视角修复说明

## 🎯 问题描述

加载 AAA 3D Tiles 模型时，初始化视角模型是歪的，没有摆正。

## 🔍 问题原因

配置文件 `public/config/scene_aaa.json` 中的相机坐标都是 0：

```json
"camera": {
  "longitude": 0,
  "latitude": 0,
  "height": 1000,
  "heading": 0,
  "pitch": -90,
  "roll": 0
}
```

当经纬度为 (0, 0) 时，相机会定位到非洲几内亚湾，而不是模型所在位置。

## ✅ 解决方案

### 方案 1: 自动定位（已实现）⭐

修改了 `sdk/core/SceneManager.ts`，添加自动定位功能：

```typescript
// 如果相机坐标为 0，自动定位到模型
if (scene.camera && scene.camera.longitude !== 0 && scene.camera.latitude !== 0) {
  // 使用配置的相机位置
  this.setCameraPosition(scene.camera)
} else {
  // 自动定位到第一个 Tileset
  await this.autoPositionCamera()
}
```

**自动定位功能**：
```typescript
private async autoPositionCamera(): Promise<void> {
  const primitives = this.viewer.scene.primitives
  if (primitives.length > 0) {
    const tileset = primitives.get(0) as Cesium.Cesium3DTileset
    
    // 使用 zoomTo 自动定位，俯视角度
    await this.viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(
      0,      // heading: 0 (正北)
      -1.57,  // pitch: -90度 (俯视)
      0       // range: 自动计算距离
    ))
  }
}
```

**优点**：
- ✅ 无需手动配置坐标
- ✅ 自动计算最佳视角
- ✅ 适用于任何模型
- ✅ 俯视角度（pitch: -90°）

---

### 方案 2: 手动配置相机坐标

如果你想要精确控制相机位置，可以手动配置：

#### 步骤 1: 获取模型中心坐标

在浏览器控制台输入：

```javascript
const tileset = viewer.scene.primitives.get(0)
const center = tileset.boundingSphere.center
const cartographic = Cesium.Cartographic.fromCartesian(center)

const longitude = Cesium.Math.toDegrees(cartographic.longitude)
const latitude = Cesium.Math.toDegrees(cartographic.latitude)
const height = cartographic.height

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📍 模型中心坐标:')
console.log('经度:', longitude)
console.log('纬度:', latitude)
console.log('高度:', height)
console.log('建议相机高度:', height + 1000)  // 模型高度 + 1000
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
```

#### 步骤 2: 编辑配置文件

打开 `public/config/scene_aaa.json`，修改 camera 部分：

```json
{
  "camera": {
    "longitude": 113.06090721905448,  // ⭐ 填入步骤 1 获取的经度
    "latitude": 22.645399902809583,   // ⭐ 填入步骤 1 获取的纬度
    "height": 1000,                    // ⭐ 填入建议的相机高度
    "heading": 0,                      // 0 = 正北
    "pitch": -90,                      // -90 = 俯视
    "roll": 0
  }
}
```

#### 步骤 3: 刷新页面

保存文件后，刷新浏览器（F5）

---

## 🎨 相机参数说明

### heading（偏航角）
- `0` = 正北
- `90` = 正东
- `180` = 正南
- `270` = 正西

### pitch（俯仰角）
- `0` = 水平
- `-90` = 俯视（从上往下看）⭐ 推荐
- `90` = 仰视（从下往上看）
- `-45` = 45度俯视

### roll（翻滚角）
- 通常保持 `0`

### height（高度）
- 相机距离地面的高度（米）
- 建议值：模型高度 + 500 到 2000
- 太低：看不全模型
- 太高：模型太小

---

## 🔧 调试技巧

### 1. 查看当前相机位置

```javascript
const camera = viewer.camera
const position = camera.positionCartographic

console.log('当前相机位置:')
console.log('经度:', Cesium.Math.toDegrees(position.longitude))
console.log('纬度:', Cesium.Math.toDegrees(position.latitude))
console.log('高度:', position.height)
console.log('Heading:', Cesium.Math.toDegrees(camera.heading))
console.log('Pitch:', Cesium.Math.toDegrees(camera.pitch))
console.log('Roll:', Cesium.Math.toDegrees(camera.roll))
```

### 2. 手动调整相机

```javascript
// 飞到指定位置
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(113.06, 22.64, 1000),
  orientation: {
    heading: Cesium.Math.toRadians(0),
    pitch: Cesium.Math.toRadians(-90),
    roll: 0
  }
})
```

### 3. 自动定位到模型

```javascript
const tileset = viewer.scene.primitives.get(0)
await viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0, -1.57, 0))
```

### 4. 测试不同角度

```javascript
// 俯视（推荐）
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(113.06, 22.64, 1000),
  orientation: {
    heading: 0,
    pitch: Cesium.Math.toRadians(-90),  // 俯视
    roll: 0
  }
})

// 45度角
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(113.06, 22.64, 1500),
  orientation: {
    heading: 0,
    pitch: Cesium.Math.toRadians(-45),  // 45度
    roll: 0
  }
})

// 侧视
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(113.06, 22.64, 500),
  orientation: {
    heading: Cesium.Math.toRadians(45),
    pitch: Cesium.Math.toRadians(-30),
    roll: 0
  }
})
```

---

## 📊 推荐配置

### 俯视角度（推荐）⭐

```json
{
  "camera": {
    "longitude": 113.06,
    "latitude": 22.64,
    "height": 1000,
    "heading": 0,
    "pitch": -90,
    "roll": 0
  }
}
```

**适用场景**：
- 查看整体布局
- 单体化高亮
- 楼栋选择

### 45度角

```json
{
  "camera": {
    "longitude": 113.06,
    "latitude": 22.64,
    "height": 1500,
    "heading": 0,
    "pitch": -45,
    "roll": 0
  }
}
```

**适用场景**：
- 查看建筑细节
- 立体感更强
- 展示效果

### 侧视角度

```json
{
  "camera": {
    "longitude": 113.06,
    "latitude": 22.64,
    "height": 500,
    "heading": 45,
    "pitch": -30,
    "roll": 0
  }
}
```

**适用场景**：
- 查看建筑立面
- 特定角度展示

---

## 🎯 当前状态

✅ **已实现自动定位功能**

现在的行为：
1. 如果配置文件中的经纬度不为 0 → 使用配置的相机位置
2. 如果配置文件中的经纬度为 0 → 自动定位到模型（俯视角度）

**AAA 模型**：
- 配置文件中经纬度为 0
- 自动使用自动定位功能 ✅
- 相机会自动定位到模型中心，俯视角度

**保利模型**：
- 配置文件中有正确的经纬度
- 使用配置的相机位置 ✅

---

## 🚀 测试

### 1. 启动项目

```bash
npm run dev
```

### 2. 查看效果

打开浏览器，应该看到：
- ✅ 模型正面显示（不歪）
- ✅ 俯视角度
- ✅ 完整的模型视图

### 3. 如果还是不对

在控制台运行：

```javascript
// 重新定位
const tileset = viewer.scene.primitives.get(0)
await viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0, -1.57, 0))
```

---

## 💡 总结

**问题**：相机坐标为 0，导致视角不对

**解决**：
1. ✅ 自动定位功能（已实现）- 无需配置
2. ⚙️ 手动配置坐标 - 精确控制

**推荐**：使用自动定位功能，简单快速！

---

**修复时间**: 2026-03-02  
**版本**: SDK v1.2
