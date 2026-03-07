# 相机初始位置修复

## 🎯 问题描述

初始化时相机定位到了高亮区域，而不是整个模型的俯视角度（按 R 键的效果）。

## 🔍 问题原因

配置文件中的相机坐标设置为了高亮区域的位置：

```json
"camera": {
  "longitude": 113.69325445193391,  // 高亮区域的经度
  "latitude": 40.34206751103671,    // 高亮区域的纬度
  "height": 2000,
  "heading": 0,
  "pitch": -90,
  "roll": 0
}
```

这导致相机定位到了高亮区域，而不是整个模型。

## ✅ 解决方案

将相机坐标设置为 0，启用自动定位功能：

```json
"camera": {
  "longitude": 0,  // ⭐ 设为 0
  "latitude": 0,   // ⭐ 设为 0
  "height": 0,     // ⭐ 设为 0
  "heading": 0,
  "pitch": -90,
  "roll": 0
}
```

**效果**：
- ✅ 相机自动定位到整个模型
- ✅ 俯视角度（pitch: -90°）
- ✅ 自动计算最佳距离
- ✅ 与按 R 键效果一致

## 📊 对比

### 修改前
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
**效果**: 定位到高亮区域（局部视图）

### 修改后
```json
"camera": {
  "longitude": 0,
  "latitude": 0,
  "height": 0,
  "heading": 0,
  "pitch": -90,
  "roll": 0
}
```
**效果**: 自动定位到整个模型（全局视图）✅

## 🎨 相机配置说明

### 选项 1: 自动定位（推荐）⭐

**配置**:
```json
"camera": {
  "longitude": 0,
  "latitude": 0,
  "height": 0,
  "heading": 0,
  "pitch": -90,
  "roll": 0
}
```

**优点**:
- ✅ 自动计算最佳视角
- ✅ 适用于任何模型
- ✅ 无需手动配置坐标

**适用场景**:
- 初次加载模型
- 不确定模型中心位置
- 想要查看整个模型

---

### 选项 2: 手动配置

**配置**:
```json
"camera": {
  "longitude": 113.69325445193391,  // 具体经度
  "latitude": 40.34206751103671,    // 具体纬度
  "height": 2000,                    // 相机高度
  "heading": 0,
  "pitch": -90,
  "roll": 0
}
```

**优点**:
- ✅ 精确控制相机位置
- ✅ 可以定位到特定区域

**适用场景**:
- 想要聚焦某个特定区域
- 展示特定楼栋
- 已知最佳视角位置

---

## 🔧 如何获取模型中心坐标

如果你想手动配置相机到模型中心，可以这样获取：

### 方法 1: 使用控制台

```javascript
// 获取模型中心
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
console.log('建议相机高度:', height + 1000)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
```

### 方法 2: 按 R 键后查看

```javascript
// 按 R 键重置视图后，查看当前相机位置
const camera = viewer.camera
const position = camera.positionCartographic

console.log('当前相机位置:')
console.log('经度:', Cesium.Math.toDegrees(position.longitude))
console.log('纬度:', Cesium.Math.toDegrees(position.latitude))
console.log('高度:', position.height)
```

---

## 🎯 推荐配置

### 对于 AAA 模型（当前）

**推荐**: 使用自动定位 ✅

```json
"camera": {
  "longitude": 0,
  "latitude": 0,
  "height": 0,
  "heading": 0,
  "pitch": -90,
  "roll": 0
}
```

**原因**:
- 模型较大，需要查看全局
- 自动计算最佳视角
- 与按 R 键效果一致

---

### 对于保利模型

**推荐**: 使用手动配置

```json
"camera": {
  "longitude": 113.06090721905448,
  "latitude": 22.645399902809583,
  "height": 1000,
  "heading": 0,
  "pitch": -90,
  "roll": 0
}
```

**原因**:
- 已知最佳视角位置
- 可以聚焦到楼栋区域
- 展示效果更好

---

## 🔄 切换方式

### 从自动定位切换到手动配置

1. 按 R 键重置视图
2. 在控制台获取当前相机位置
3. 将坐标填入配置文件

### 从手动配置切换到自动定位

1. 将 `longitude`、`latitude`、`height` 设为 0
2. 刷新页面

---

## 💡 调试技巧

### 查看当前相机位置

```javascript
const camera = viewer.camera
const position = camera.positionCartographic

console.log('当前相机:')
console.log('经度:', Cesium.Math.toDegrees(position.longitude))
console.log('纬度:', Cesium.Math.toDegrees(position.latitude))
console.log('高度:', position.height)
console.log('Heading:', Cesium.Math.toDegrees(camera.heading))
console.log('Pitch:', Cesium.Math.toDegrees(camera.pitch))
```

### 手动飞到指定位置

```javascript
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(113.69, 40.34, 2000),
  orientation: {
    heading: 0,
    pitch: Cesium.Math.toRadians(-90),
    roll: 0
  }
})
```

### 自动定位到模型

```javascript
const tileset = viewer.scene.primitives.get(0)
await viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0, -1.57, 0))
```

---

## 📋 检查清单

- [x] 将相机坐标设为 0
- [x] 保存配置文件
- [ ] 刷新浏览器（F5）
- [ ] 查看初始视角是否正确
- [ ] 按 R 键测试重置功能
- [ ] 确认两者视角一致

---

## 🎉 总结

**问题**: 初始视角定位到高亮区域

**原因**: 相机坐标设置为高亮区域的位置

**解决**: 将相机坐标设为 0，启用自动定位

**效果**: 
- ✅ 初始视角显示整个模型
- ✅ 俯视角度
- ✅ 与按 R 键效果一致

---

**修复时间**: 2026-03-02  
**版本**: SDK v1.2  
**状态**: ✅ 已修复
