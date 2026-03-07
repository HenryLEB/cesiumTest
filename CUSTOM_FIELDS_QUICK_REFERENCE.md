# 自定义字段快速参考

## 快速开始

### 1. 在配置文件中添加自定义字段

编辑 `public/config/scene_aaa.json`：

```json
{
  "buildings": [
    {
      "id": "aaa_building1",
      "name": "行政楼",
      "customData": {
        "buildingCode": "AAA-001",
        "buildingType": "office",
        "floor": 20,
        "area": 5000,
        "apiEndpoint": "/api/buildings/detail"
      }
    }
  ]
}
```

### 2. 在点击事件中使用

编辑 `src/components/CesiumViewerSDK.vue`，在 `handleClick()` 函数中添加：

```typescript
// 获取建筑配置
const scene = sdk.getCurrentScene()
const building = scene?.buildings.find(b => b.id === buildingId)

// 使用自定义字段发送 API 请求
if (building?.customData) {
  fetchBuildingDetails(building)
}
```

### 3. 创建 API 请求函数

```typescript
const fetchBuildingDetails = async (building: any): Promise<void> => {
  const customData = building.customData
  
  try {
    const response = await fetch(customData.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buildingCode: customData.buildingCode,
        buildingType: customData.buildingType,
        floor: customData.floor,
        area: customData.area
      })
    })

    const data = await response.json()
    console.log('✅ API 响应:', data)
  } catch (error) {
    console.error('❌ API 请求失败:', error)
  }
}
```

## 常用字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| `buildingCode` | string | 建筑编码 | "AAA-001" |
| `buildingType` | string | 建筑类型 | "office", "research" |
| `floor` | number | 楼层数 | 20 |
| `area` | number | 建筑面积 | 5000 |
| `department` | string | 所属部门 | "行政部" |
| `apiEndpoint` | string | API 端点 | "/api/buildings/detail" |
| `extraParams` | object | 额外参数 | { "region": "north" } |

## 完整示例

### 配置文件

```json
{
  "id": "aaa_project",
  "name": "AAA 项目",
  "buildings": [
    {
      "id": "aaa_building1",
      "name": "行政楼",
      "tilesetUrl": "/aaa/3dtiles/tileset.json",
      "monomerization": { ... },
      "marker": { ... },
      "customData": {
        "buildingCode": "AAA-001",
        "buildingType": "office",
        "floor": 20,
        "area": 5000,
        "department": "行政部",
        "apiEndpoint": "/api/buildings/detail",
        "extraParams": {
          "region": "north",
          "zone": "A"
        }
      }
    }
  ]
}
```

### 代码实现

```typescript
// 在 handleClick() 中
if (building?.customData) {
  fetchBuildingDetails(building)
}

// API 请求函数
const fetchBuildingDetails = async (building: any): Promise<void> => {
  const customData = building.customData
  
  console.log('📡 发送 API 请求')
  console.log('建筑编码:', customData.buildingCode)
  console.log('建筑类型:', customData.buildingType)

  try {
    const response = await fetch(customData.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      body: JSON.stringify({
        buildingCode: customData.buildingCode,
        buildingType: customData.buildingType,
        floor: customData.floor,
        area: customData.area,
        department: customData.department,
        ...customData.extraParams
      })
    })

    const data = await response.json()
    console.log('✅ API 响应:', data)
    
    // 处理响应数据
    handleApiResponse(building, data)
  } catch (error) {
    console.error('❌ API 请求失败:', error)
  }
}

const handleApiResponse = (building: any, data: any): void => {
  console.log('建筑名称:', building.name)
  console.log('响应数据:', data)
  // 显示弹窗、更新 UI 等
}
```

## 不同请求方式

### GET 请求

```typescript
const url = `${customData.apiEndpoint}?code=${customData.buildingCode}&type=${customData.buildingType}`
const response = await fetch(url)
const data = await response.json()
```

### POST 请求

```typescript
const response = await fetch(customData.apiEndpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    buildingCode: customData.buildingCode,
    buildingType: customData.buildingType
  })
})
const data = await response.json()
```

### 带认证的请求

```typescript
const response = await fetch(customData.apiEndpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  },
  body: JSON.stringify(customData)
})
```

## 根据建筑类型调用不同 API

```typescript
const fetchBuildingDetails = async (building: any): Promise<void> => {
  const customData = building.customData
  
  switch (customData.buildingType) {
    case 'office':
      await fetch('/api/office/details', { ... })
      break
    case 'research':
      await fetch('/api/research/details', { ... })
      break
    default:
      await fetch('/api/buildings/details', { ... })
  }
}
```

## 文件位置

- **配置文件**: `public/config/scene_aaa.json`
- **类型定义**: `sdk/types/index.ts`
- **点击处理**: `src/components/CesiumViewerSDK.vue`
- **示例配置**: `public/config/scene_aaa_with_custom_fields.json`
- **代码示例**: `examples/custom-fields-usage.ts`

## 相关文档

- `CUSTOM_FIELDS_API_EXAMPLE.md` - 详细示例和说明
- `BUILDING_CLICK_LOGIC.md` - 点击逻辑说明
- `CUSTOM_CLICK_EVENT_GUIDE.md` - 自定义点击事件指南

## 注意事项

1. ✅ `customData` 字段是可选的，不影响现有功能
2. ✅ 可以添加任意自定义字段
3. ✅ TypeScript 类型已更新，支持类型检查
4. ✅ 配置驱动，无需修改核心代码
5. ⚠️ API 请求需要处理错误和超时
6. ⚠️ 注意跨域问题（CORS）
7. ⚠️ 敏感信息（如 Token）不要写在配置文件中
