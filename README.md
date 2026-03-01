# Vue3 + Cesium 3D Tiles 查看器

这是一个使用 Vue3 和 Cesium.js 加载本地 3D Tiles 模型的项目。

## ✨ 最新更新

**v2.0 - 代码重构优化版本**

- ✅ 模块化架构 - 代码从 1094 行优化到 200 行主组件
- ✅ TypeScript 类型安全 - 100% 类型覆盖
- ✅ 完善的资源管理 - 防止内存泄漏
- ✅ 环境感知日志 - 开发/生产环境自动切换
- ✅ 更好的可维护性 - 清晰的代码结构

**v2.1 - 通用化改造版本** ⭐

- ✅ 场景管理系统 - 支持多场景动态切换
- ✅ 自动检测模式 - 自动识别模型边界
- ✅ 通用单体化 - 不再绑定特定模型
- ✅ 易于迁移 - 可快速应用到其他项目
- ✅ 批量处理 - 支持批量生成配置

详见:
- [OPTIMIZATION.md](OPTIMIZATION.md) - 代码优化详情
- [UNIVERSAL_GUIDE.md](UNIVERSAL_GUIDE.md) - 通用化使用指南 ⭐
- [UNIVERSAL_SUMMARY.md](UNIVERSAL_SUMMARY.md) - 通用化改造总结 ⭐

## 项目特性

- ✨ Vue3 + TypeScript
- 🚀 Vite 构建工具
- 🌍 Cesium.js 3D 引擎
- 📦 支持本地 3D Tiles 模型加载
- 🎯 纯模型展示，不显示地球等地理信息
- 🖱️ 完整的交互功能：旋转、缩放、移动

## 交互控制

| 操作 | 控制方式 |
|------|---------|
| 旋转模型 | 左键拖动 |
| 移动模型 | 右键拖动 |
| 缩放模型 | 鼠标滚轮 |
| 重置视图 | 按 R 键 |

## 开发运行

```bash
npm run dev
```

访问 `http://localhost:5173/` 查看应用。

## 生产构建

```bash
npm run build
```

## 预览生产构建

```bash
npm run preview
```

## 模型加载说明

### 1. 准备 3D Tiles 模型

将您的 3D Tiles 模型文件放入 `public/models/` 目录中。模型需要包含 `tileset.json` 文件。

### 2. 配置模型路径

编辑 `src/components/CesiumViewer.vue`，修改 `loadTileset` 函数中的路径：

```typescript
await loadTileset('/models/tileset.json')
```

### 3. 自定义查看器配置

在 CesiumViewer.vue 的 `onMounted` 中可以自定义各种设置：

- **禁用地球显示**：已默认禁用 (`viewer.value.scene.globe.show = false`)
- **隐藏 UI 控件**：根据需要调整 Viewer 初始化选项
- **设置背景颜色**：修改 `Cesium.Color.fromCssColorString('#000000')`
- **自动适配视图**：通过 `viewer.value.zoomTo()` 方法

## 交互功能详解

### 1. 旋转模型
- **操作**：左键拖动鼠标
- **功能**：环绕模型中心旋转查看
- **灵敏度**：在 `rotateModel` 函数中修改 `sensitivity` 参数

### 2. 移动模型
- **操作**：右键拖动鼠标
- **功能**：平移模型在屏幕上的位置
- **灵敏度**：在 `panModel` 函数中修改 `sensitivity` 参数

### 3. 缩放模型
- **操作**：鼠标滚轮向上/向下
- **功能**：放大或缩小模型
- **灵敏度**：在 `zoomModel` 函数中修改 `zoomSpeed` 参数

### 4. 重置视图
- **操作**：按 R 键
- **功能**：恢复初始视图，模型自动居中并适配到最佳显示位置

### 自定义交互灵敏度

在 [src/components/CesiumViewer.vue](src/components/CesiumViewer.vue) 中调整：

```typescript
// 旋转灵敏度
const rotateModel = (deltaX: number, deltaY: number) => {
  const sensitivity = 0.005  // 修改这个值，越大越灵敏
  // ...
}

// 移动灵敏度
const panModel = (deltaX: number, deltaY: number) => {
  const sensitivity = 0.001  // 修改这个值
  // ...
}

// 缩放灵敏度
const zoomModel = (wheelDelta: number) => {
  const zoomSpeed = 0.1  // 修改这个值
  // ...
}
```

## 核心配置说明

### Viewer 初始化选项

```typescript
new Cesium.Viewer('cesiumContainer', {
  animation: false,          // 关闭动画控制器
  baseLayerPicker: false,    // 关闭基础地层选择器
  fullscreenButton: true,    // 显示全屏按钮
  vrButton: false,           // 关闭 VR 按钮
  geocoder: false,           // 关闭地址搜索栏
  homeButton: false,         // 关闭首页按钮
  infoBox: false,            // 关闭信息框
  sceneModePicker: false,    // 关闭场景模式选择器
  selectionIndicator: false, // 关闭选择指示器
  timeline: false,           // 关闭时间轴
  navigationHelpButton: false // 关闭导航帮助按钮
})
```

### 禁用地球

```typescript
viewer.value.imageryLayers.removeAll()  // 移除所有图像层
viewer.value.scene.globe.show = false   // 隐藏地球
```

## 文件结构

```
cetest/
├── src/
│   ├── types/
│   │   └── building.ts          # TypeScript 类型定义
│   ├── config/
│   │   └── buildings.ts         # 楼栋配置数据
│   ├── utils/
│   │   ├── logger.ts            # 日志工具
│   │   ├── cesiumHelper.ts      # Cesium 辅助函数
│   │   ├── highlightManager.ts  # 单体化高亮管理
│   │   ├── buildingManager.ts   # 楼栋管理
│   │   └── interactionManager.ts # 交互管理
│   ├── components/
│   │   └── CesiumViewer.vue     # Cesium 查看器组件
│   ├── App.vue                  # 主应用组件
│   └── main.ts                  # 应用入口
├── public/
│   └── models/                  # 3D Tiles 模型目录
├── index.html                   # HTML 模板
├── vite.config.ts              # Vite 配置
├── tsconfig.json               # TypeScript 配置
├── package.json                # 项目依赖
├── OPTIMIZATION.md             # 优化详情 ⭐
├── MIGRATION_GUIDE.md          # 迁移指南 ⭐
└── OPTIMIZATION_SUMMARY.md     # 优化总结 ⭐
```

## 常见问题

### Q: 如何加载多个模型？
A: 在 `CesiumViewer.vue` 的 `onMounted` 中多次调用 `loadTileset`：

```typescript
await loadTileset('/models/model1/tileset.json')
await loadTileset('/models/model2/tileset.json')
```

### Q: 如何调整模型的位置和大小？
A: 使用 Cesium 的变换功能：

```typescript
const matrix = Cesium.Cesium3DTileset.computeMetamatrix(
  tileset,
  Cesium.Cartesian3.fromDegrees(0, 0, 0)
)
tileset.modelMatrix = matrix
```

### Q: 如何与模型交互（点击、拖动等）？
A: 使用 Cesium 的 `scene.pickPosition()` 和事件监听器。

## 许可证

MIT

## 依赖版本

- Vue: 3.x
- Cesium: 最新版本
- Vite: 7.x
