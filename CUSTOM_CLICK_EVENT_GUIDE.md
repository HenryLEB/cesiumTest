# 自定义点击事件指南

## 📍 点击事件位置

**文件**: `src/components/CesiumViewerSDK.vue`  
**函数**: `handleClick`  
**行数**: 110-193

---

## 🎯 当前点击事件逻辑

### 点击楼栋/标记时
```typescript
if (modelData.cesiumType === 'buildingMarker' || modelData.cesiumType === 'cylinderBuilding') {
  const buildingId = modelData.buildingId
  console.log('🏢 点击的楼栋ID:', buildingId)

  // 1. 清除所有高亮
  sdk.clearAllHighlights()

  // 2. 创建新高亮
  sdk.createHighlight(buildingId)

  // 3. 显示楼栋信息
  sdk.showBuildingInfo(buildingId)
}
```

### 点击空白区域时
```typescript
// 1. 清除所有高亮
sdk.clearAllHighlights()

// 2. 隐藏所有信息
const scene = sdk.getCurrentScene()
if (scene) {
  scene.buildings.forEach(building => {
    sdk.hideBuildingInfo(building.id)
  })
}
```

---

## 🎨 自定义示例

### 示例 1: 添加自定义弹窗

```typescript
// 在 handleClick 函数中，点击楼栋时添加：
if (modelData.cesiumType === 'buildingMarker' || modelData.cesiumType === 'cylinderBuilding') {
  const buildingId = modelData.buildingId
  
  // 清除所有高亮
  sdk.clearAllHighlights()
  
  // 创建新高亮
  sdk.createHighlight(buildingId)
  
  // 显示楼栋信息
  sdk.showBuildingInfo(buildingId)
  
  // ⭐ 添加自定义弹窗
  const scene = sdk.getCurrentScene()
  const building = scene?.buildings.find(b => b.id === buildingId)
  if (building) {
    alert(`你点击了：${building.name}`)
    // 或者使用自定义弹窗组件
    // showCustomDialog(building)
  }
}
```

---

### 示例 2: 发送 HTTP 请求

```typescript
// 点击楼栋时获取详细信息
if (modelData.cesiumType === 'buildingMarker' || modelData.cesiumType === 'cylinderBuilding') {
  const buildingId = modelData.buildingId
  
  sdk.clearAllHighlights()
  sdk.createHighlight(buildingId)
  sdk.showBuildingInfo(buildingId)
  
  // ⭐ 发送 HTTP 请求获取详细信息
  fetch(`/api/buildings/${buildingId}`)
    .then(response => response.json())
    .then(data => {
      console.log('楼栋详细信息:', data)
      // 显示详细信息
      // showBuildingDetails(data)
    })
    .catch(error => {
      console.error('获取楼栋信息失败:', error)
    })
}
```

---

### 示例 3: 触发自定义事件

```typescript
// 点击楼栋时触发自定义事件
if (modelData.cesiumType === 'buildingMarker' || modelData.cesiumType === 'cylinderBuilding') {
  const buildingId = modelData.buildingId
  
  sdk.clearAllHighlights()
  sdk.createHighlight(buildingId)
  sdk.showBuildingInfo(buildingId)
  
  // ⭐ 触发自定义事件
  window.dispatchEvent(new CustomEvent('buildingClicked', {
    detail: {
      buildingId: buildingId,
      timestamp: Date.now()
    }
  }))
}

// 在其他地方监听事件
window.addEventListener('buildingClicked', (event) => {
  console.log('楼栋被点击:', event.detail)
})
```

---

### 示例 4: 飞到楼栋位置

```typescript
// 点击楼栋时飞到该位置
if (modelData.cesiumType === 'buildingMarker' || modelData.cesiumType === 'cylinderBuilding') {
  const buildingId = modelData.buildingId
  
  sdk.clearAllHighlights()
  sdk.createHighlight(buildingId)
  sdk.showBuildingInfo(buildingId)
  
  // ⭐ 飞到楼栋位置
  const scene = sdk.getCurrentScene()
  const building = scene?.buildings.find(b => b.id === buildingId)
  if (building && building.marker) {
    viewer.value?.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        building.marker.longitude,
        building.marker.latitude,
        building.marker.height + 500  // 高度 + 500
      ),
      orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-45),  // 45度俯视
        roll: 0
      },
      duration: 2  // 飞行时间 2 秒
    })
  }
}
```

---

### 示例 5: 切换不同颜色

```typescript
// 点击楼栋时切换高亮颜色
const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6']
let colorIndex = 0

if (modelData.cesiumType === 'buildingMarker' || modelData.cesiumType === 'cylinderBuilding') {
  const buildingId = modelData.buildingId
  
  sdk.clearAllHighlights()
  
  // ⭐ 使用不同颜色
  const color = colors[colorIndex % colors.length]
  colorIndex++
  
  // 需要修改 SDK 支持自定义颜色，或者直接操作配置
  sdk.createHighlight(buildingId)
  sdk.showBuildingInfo(buildingId)
  
  console.log(`使用颜色: ${color}`)
}
```

---

### 示例 6: 记录点击历史

```typescript
// 记录点击历史
const clickHistory: string[] = []

if (modelData.cesiumType === 'buildingMarker' || modelData.cesiumType === 'cylinderBuilding') {
  const buildingId = modelData.buildingId
  
  sdk.clearAllHighlights()
  sdk.createHighlight(buildingId)
  sdk.showBuildingInfo(buildingId)
  
  // ⭐ 记录点击历史
  clickHistory.push(buildingId)
  console.log('点击历史:', clickHistory)
  
  // 限制历史记录数量
  if (clickHistory.length > 10) {
    clickHistory.shift()
  }
}
```

---

### 示例 7: 双击事件

```typescript
// 在 setupInteractions 函数中添加双击事件
const setupInteractions = (): void => {
  if (!viewer.value) return

  const scene = viewer.value.scene
  handler = new Cesium.ScreenSpaceEventHandler(scene.canvas)

  // ... 现有代码

  // ⭐ 添加双击事件
  handler.setInputAction((click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
    const pickedObject = viewer.value?.scene.pick(click.position)
    
    if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.name) {
      try {
        const modelData = JSON.parse(pickedObject.id.name)
        
        if (modelData.cesiumType === 'buildingMarker' || modelData.cesiumType === 'cylinderBuilding') {
          const buildingId = modelData.buildingId
          console.log('🏢 双击楼栋:', buildingId)
          
          // 双击时执行不同的操作
          // 例如：打开详情页面
          window.open(`/building/${buildingId}`, '_blank')
        }
      } catch (error) {
        console.error('解析失败:', error)
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
}
```

---

### 示例 8: 右键菜单

```typescript
// 添加右键菜单
handler.setInputAction((click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
  const pickedObject = viewer.value?.scene.pick(click.position)
  
  if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.name) {
    try {
      const modelData = JSON.parse(pickedObject.id.name)
      
      if (modelData.cesiumType === 'buildingMarker' || modelData.cesiumType === 'cylinderBuilding') {
        const buildingId = modelData.buildingId
        
        // ⭐ 显示右键菜单
        showContextMenu(click.position, buildingId)
      }
    } catch (error) {
      console.error('解析失败:', error)
    }
  }
}, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

// 右键菜单函数
const showContextMenu = (position: Cesium.Cartesian2, buildingId: string) => {
  // 创建菜单
  const menu = document.createElement('div')
  menu.style.position = 'absolute'
  menu.style.left = `${position.x}px`
  menu.style.top = `${position.y}px`
  menu.style.background = 'white'
  menu.style.border = '1px solid #ccc'
  menu.style.padding = '10px'
  menu.style.zIndex = '1000'
  
  menu.innerHTML = `
    <div onclick="alert('查看详情: ${buildingId}')">查看详情</div>
    <div onclick="alert('编辑: ${buildingId}')">编辑</div>
    <div onclick="alert('删除: ${buildingId}')">删除</div>
  `
  
  document.body.appendChild(menu)
  
  // 点击其他地方关闭菜单
  setTimeout(() => {
    document.addEventListener('click', () => {
      menu.remove()
    }, { once: true })
  }, 100)
}
```

---

## 🔧 完整的自定义示例

### 修改 handleClick 函数

```typescript
/**
 * 处理点击事件
 */
const handleClick = (click: Cesium.ScreenSpaceEventHandler.PositionedEvent): void => {
  if (!viewer.value || !sdk) return

  const pickedObject = viewer.value.scene.pick(click.position)

  // 获取点击位置的坐标
  const pickPosition = viewer.value.scene.pickPosition(click.position)
  if (Cesium.defined(pickPosition)) {
    const cartographic = Cesium.Cartographic.fromCartesian(pickPosition)
    const longitude = Cesium.Math.toDegrees(cartographic.longitude)
    const latitude = Cesium.Math.toDegrees(cartographic.latitude)
    const height = cartographic.height

    // 坐标日志（可以注释掉）
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎯 点击位置:', { longitude, latitude, height })
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  }

  if (Cesium.defined(pickedObject)) {
    console.log('✅ 点击到了物体')

    if (pickedObject.id && pickedObject.id.name) {
      try {
        const modelData = JSON.parse(pickedObject.id.name)

        if (modelData.cesiumType === 'buildingMarker' || modelData.cesiumType === 'cylinderBuilding') {
          const buildingId = modelData.buildingId
          console.log('🏢 点击的楼栋ID:', buildingId)

          // ========== 自定义逻辑开始 ==========
          
          // 1. 清除所有高亮
          sdk.clearAllHighlights()

          // 2. 创建新高亮
          sdk.createHighlight(buildingId)

          // 3. 显示楼栋信息
          sdk.showBuildingInfo(buildingId)

          // 4. ⭐ 添加你的自定义逻辑
          const scene = sdk.getCurrentScene()
          const building = scene?.buildings.find(b => b.id === buildingId)
          
          if (building) {
            // 示例：发送事件
            window.dispatchEvent(new CustomEvent('buildingClicked', {
              detail: { buildingId, building }
            }))
            
            // 示例：调用 API
            // fetchBuildingDetails(buildingId)
            
            // 示例：显示弹窗
            // showBuildingDialog(building)
            
            // 示例：飞到楼栋
            // flyToBuilding(building)
          }
          
          // ========== 自定义逻辑结束 ==========
        }
      } catch (error) {
        console.error('解析模型数据失败:', error)
      }
    }
  } else {
    console.log('🖱️ 点击了空白区域')

    if (!sdk) return

    // ========== 点击空白区域的自定义逻辑 ==========
    
    // 1. 清除所有高亮
    sdk.clearAllHighlights()

    // 2. 隐藏所有信息
    const scene = sdk.getCurrentScene()
    if (scene) {
      const sdkRef = sdk
      scene.buildings.forEach(building => {
        sdkRef.hideBuildingInfo(building.id)
      })
    }
    
    // 3. ⭐ 添加你的自定义逻辑
    // 示例：发送事件
    window.dispatchEvent(new CustomEvent('emptyAreaClicked'))
    
    // 示例：关闭弹窗
    // closeAllDialogs()
    
    // ========== 自定义逻辑结束 ==========
  }
}
```

---

## 📋 常见自定义需求

### 1. 点击后打开详情页面

```typescript
// 在点击楼栋后添加
window.location.href = `/building/${buildingId}`
// 或
window.open(`/building/${buildingId}`, '_blank')
```

### 2. 点击后显示 Vue 组件弹窗

```typescript
// 在 script setup 中定义
const showDialog = ref(false)
const selectedBuilding = ref(null)

// 在点击事件中
if (building) {
  selectedBuilding.value = building
  showDialog.value = true
}
```

### 3. 点击后调用父组件方法

```typescript
// 定义 emit
const emit = defineEmits(['buildingClicked'])

// 在点击事件中
emit('buildingClicked', { buildingId, building })
```

### 4. 点击后修改高亮样式

```typescript
// 需要修改配置或直接操作 HighlightManager
// 这需要扩展 SDK 功能
```

---

## 💡 提示

1. **不要删除现有逻辑**：在现有逻辑基础上添加自定义代码
2. **注意性能**：避免在点击事件中执行耗时操作
3. **错误处理**：添加 try-catch 处理异常
4. **调试**：使用 console.log 调试自定义逻辑
5. **测试**：修改后充分测试各种点击场景

---

## 🎯 快速定位

**文件**: `src/components/CesiumViewerSDK.vue`  
**搜索**: `handleClick` 或 `点击的楼栋ID`  
**行数**: 约 110-193 行

---

**更新时间**: 2026-03-02  
**版本**: SDK v1.2
