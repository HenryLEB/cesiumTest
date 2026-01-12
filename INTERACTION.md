# 交互控制快速参考

## 鼠标操作

### 旋转模型
```
左键拖动 → 旋转模型
```
- 水平拖动：模型左右旋转
- 垂直拖动：模型上下旋转
- 灵敏度：在 `rotateModel()` 函数中的 `sensitivity = 0.005`

### 移动模型
```
右键拖动 → 移动模型
```
- 水平拖动：模型左右移动
- 垂直拖动：模型上下移动
- 灵敏度：在 `panModel()` 函数中的 `sensitivity = 0.001`

### 缩放模型
```
滚轮向上 → 放大
滚轮向下 → 缩小
```
- 灵敏度：在 `zoomModel()` 函数中的 `zoomSpeed = 0.1`

## 键盘操作

### 重置视图
```
按 R 键 → 重置摄像头到初始位置
```
- 自动居中模型
- 自动调整到最佳显示大小

## 提示信息

应用左下角会显示实时的交互提示，包含所有可用的控制方式。

## 代码位置

所有交互逻辑都在 `src/components/CesiumViewer.vue` 中：

- `setupMouseInteractions()` - 初始化所有鼠标和键盘事件
- `rotateModel(deltaX, deltaY)` - 处理旋转
- `panModel(deltaX, deltaY)` - 处理移动
- `zoomModel(wheelDelta)` - 处理缩放
- `resetView()` - 重置视图

## 调整灵敏度

编辑对应的函数，修改参数即可：

```typescript
// 旋转灵敏度（值越大越灵敏）
const sensitivity = 0.005

// 移动灵敏度（值越大越灵敏）  
const sensitivity = 0.001

// 缩放灵敏度（值越大缩放速度越快）
const zoomSpeed = 0.1
```

## 禁用或修改交互

如果需要禁用某个交互功能，可以注释掉对应的事件监听器：

```typescript
// 注释掉这行可禁用旋转
// canvas.addEventListener('mousedown', ...)

// 注释掉这行可禁用滚轮缩放
// canvas.addEventListener('wheel', ...)

// 注释掉这行可禁用重置视图
// document.addEventListener('keydown', ...)
```

## 性能优化提示

- 对于大型模型，可能需要调整缩放灵敏度
- 鼠标移动事件触发频繁，已使用防抖优化
- 键盘事件使用简单检查，适合一般应用
