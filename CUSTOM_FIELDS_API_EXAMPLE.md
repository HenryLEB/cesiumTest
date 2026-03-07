# 自定义字段与网络请求示例

## 完整示例：添加自定义字段并发送 API 请求

### 步骤 1: 在配置文件中添加自定义字段

编辑 `public/config/scene_aaa.json`，为每个建筑添加自定义字段：

```json
{
  "id": "aaa_project",
  "name": "AAA 项目",
  "description": "AAA 3D Tiles 单体化场景",
  "buildings": [
    {
      "id": "aaa_building1",
      "name": "行政楼",
      "tilesetUrl": "/aaa/3dtiles/tileset.json",
      
      "monomerization": { ... },
      "marker": { ... },
      "info": {
        "简介": "阳高行政楼"
      },
      
      "customData": {
        "buildingCode": "AAA-001",
        "buildingType": "office",
        "floor": 20,
        "area": 5000,
        "department": "行政部",
        "apiEndpoint": "/api/buildings/detail"
      }
    },
    {
      "id": "aaa_building2",
      "name": "研发楼",
      "tilesetUrl": "/aaa/3dtiles/tileset.json",
      
      "monomerization": { ... },
      "marker": { ... },
      "info": {
        "简介": "研发中心"
      },
      
      "customData": {
        "buildingCode": "AAA-002",
        "buildingType": "research",
        "floor": 15,
        "area": 3500,
        "department": "研发部",
        "apiEndpoint": "/api/buildings/detail"
      }
    }
  ],
  "camera": { ... }
}
```

### 步骤 2: 更新 TypeScript 类型定义

编辑 `sdk/types/index.ts`，在 `BuildingConfig` 接口中添加自定义字段类型：

```typescript
/**
 * 楼栋配置
 */
export interface BuildingConfig {
  /** 楼栋唯一标识 */
  id: string
  /** 楼栋名称 */
  name: string
  /** 3D Tiles 模型 URL */
  tilesetUrl: string
  /** 单体化配置 */
  monomerization: MonomerizationConfig
  /** 标记配置 */
  marker?: MarkerConfig
  /** 信息配置 */
  info?: Record<string, string>
  
  /** 自定义数据字段 */
  customData?: {
    buildingCode?: string      // 建筑编码
    buildingType?: string      // 建筑类型
    floor?: number             // 楼层数
    area?: number              // 建筑面积
    department?: string        // 所属部门
    apiEndpoint?: string       // API 端点
    [key: string]: any         // 允许其他自定义字段
  }
  
  // 兼容旧格式（可选）
  center?: { x: number; y: number; z: number }
  dimensions?: { length: number; width: number; height: number }
  rotation?: { heading: number; pitch: number; roll: number }
  offset?: { x: number; y: number; z: number }
  color?: string
}
```

### 步骤 3: 在点击事件中使用自定义字段发送请求

编辑 `src/components/CesiumViewerSDK.vue`，修改 `handleClick()` 函数：

```typescript
/**
 * 处理点击事件
 */
const handleClick = (click: Cesium.ScreenSpaceEventHandler.PositionedEvent): void => {
  if (!viewer.value || !sdk) return

  const pickedObject = viewer.value.scene.pick(click.position)

  // ... 坐标日志代码 ...

  if (Cesium.defined(pickedObject)) {
    console.log('✅ 点击到了物体')

    if (pickedObject.id && pickedObject.id.name) {
      try {
        const modelData = JSON.parse(pickedObject.id.name)

        if (modelData.cesiumType === 'buildingMarker' || modelData.cesiumType === 'cylinderBuilding') {
          const buildingId = modelData.buildingId
          console.log('🏢 点击的楼栋ID:', buildingId)

          // 获取建筑配置（包含自定义字段）
          const scene = sdk.getCurrentScene()
          const building = scene?.buildings.find(b => b.id === buildingId)

          if (building) {
            // 检查是否已经高亮
            const existingHighlight = sdk.getHighlight(buildingId)
            
            if (existingHighlight) {
              // 取消高亮
              sdk.clearHighlight(buildingId)
              sdk.hideBuildingInfo(buildingId)
            } else {
              // 创建高亮
              sdk.clearAllHighlights()
              
              const sceneRef = sdk.getCurrentScene()
              if (sceneRef) {
                const sdkRef = sdk
                sceneRef.buildings.forEach(b => {
                  sdkRef.hideBuildingInfo(b.id)
                })
              }

              sdk.createHighlight(buildingId)
              sdk.showBuildingInfo(buildingId)

              // ⭐ 使用自定义字段发送 API 请求
              if (building.customData) {
                fetchBuildingDetails(building)
              }
            }
          }
        }
      } catch (error) {
        console.error('解析模型数据失败:', error)
      }
    }
  } else {
    // 点击空白区域
    sdk.clearAllHighlights()
    const scene = sdk.getCurrentScene()
    if (scene) {
      const sdkRef = sdk
      scene.buildings.forEach(building => {
        sdkRef.hideBuildingInfo(building.id)
      })
    }
  }
}

/**
 * 获取建筑详细信息（使用自定义字段）
 */
const fetchBuildingDetails = async (building: any): Promise<void> => {
  const customData = building.customData
  
  if (!customData) {
    console.warn('建筑没有自定义数据')
    return
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📡 发送 API 请求')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🏢 建筑信息:')
  console.log('  ID:', building.id)
  console.log('  名称:', building.name)
  console.log('  编码:', customData.buildingCode)
  console.log('  类型:', customData.buildingType)
  console.log('  楼层:', customData.floor)
  console.log('  面积:', customData.area, 'm²')
  console.log('  部门:', customData.department)
  console.log('')

  try {
    // 方式 1: 使用 GET 请求，参数在 URL 中
    const apiUrl = `${customData.apiEndpoint}?buildingCode=${customData.buildingCode}&type=${customData.buildingType}`
    console.log('📤 请求 URL:', apiUrl)
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'  // 如果需要认证
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ API 响应成功:')
    console.log(data)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // 处理响应数据
    handleApiResponse(building, data)

  } catch (error) {
    console.error('❌ API 请求失败:', error)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  }
}

/**
 * 处理 API 响应数据
 */
const handleApiResponse = (building: any, data: any): void => {
  // 示例：显示自定义弹窗
  const message = `
    建筑名称: ${building.name}
    建筑编码: ${building.customData.buildingCode}
    楼层数: ${data.floors || building.customData.floor}
    建筑面积: ${data.area || building.customData.area} m²
    使用率: ${data.occupancyRate || 'N/A'}
    最后更新: ${data.lastUpdate || 'N/A'}
  `
  
  console.log('📊 建筑详细信息:', message)
  
  // 可以在这里显示自定义 UI
  // showCustomDialog(message)
  // 或者更新页面上的信息面板
  // updateInfoPanel(data)
}
```

### 步骤 4: POST 请求示例

如果需要使用 POST 请求发送更复杂的数据：

```typescript
const fetchBuildingDetails = async (building: any): Promise<void> => {
  const customData = building.customData
  
  if (!customData) return

  try {
    // 方式 2: 使用 POST 请求，参数在请求体中
    const response = await fetch(customData.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      },
      body: JSON.stringify({
        buildingCode: customData.buildingCode,
        buildingType: customData.buildingType,
        floor: customData.floor,
        area: customData.area,
        department: customData.department,
        // 可以添加更多参数
        timestamp: new Date().toISOString(),
        userId: 'user123',
        action: 'view'
      })
    })

    const data = await response.json()
    console.log('✅ API 响应:', data)
    
    handleApiResponse(building, data)

  } catch (error) {
    console.error('❌ API 请求失败:', error)
  }
}
```

### 步骤 5: 多个 API 请求示例

如果需要根据不同的建筑类型调用不同的 API：

```typescript
const fetchBuildingDetails = async (building: any): Promise<void> => {
  const customData = building.customData
  
  if (!customData) return

  console.log('📡 根据建筑类型发送不同的 API 请求')

  try {
    // 根据建筑类型调用不同的 API
    switch (customData.buildingType) {
      case 'office':
        // 办公楼 API
        await fetchOfficeDetails(customData)
        break
      
      case 'research':
        // 研发楼 API
        await fetchResearchDetails(customData)
        break
      
      case 'residential':
        // 住宅楼 API
        await fetchResidentialDetails(customData)
        break
      
      default:
        // 通用 API
        await fetchGeneralDetails(customData)
    }

  } catch (error) {
    console.error('❌ API 请求失败:', error)
  }
}

// 办公楼详情 API
const fetchOfficeDetails = async (customData: any): Promise<void> => {
  const response = await fetch('/api/office/details', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      buildingCode: customData.buildingCode,
      department: customData.department
    })
  })
  const data = await response.json()
  console.log('🏢 办公楼详情:', data)
}

// 研发楼详情 API
const fetchResearchDetails = async (customData: any): Promise<void> => {
  const response = await fetch('/api/research/details', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      buildingCode: customData.buildingCode,
      floor: customData.floor
    })
  })
  const data = await response.json()
  console.log('🔬 研发楼详情:', data)
}

// 住宅楼详情 API
const fetchResidentialDetails = async (customData: any): Promise<void> => {
  const response = await fetch('/api/residential/details', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      buildingCode: customData.buildingCode,
      area: customData.area
    })
  })
  const data = await response.json()
  console.log('🏠 住宅楼详情:', data)
}

// 通用详情 API
const fetchGeneralDetails = async (customData: any): Promise<void> => {
  const response = await fetch('/api/buildings/details', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customData)
  })
  const data = await response.json()
  console.log('📋 建筑详情:', data)
}
```

## 完整配置文件示例

`public/config/scene_aaa.json`:

```json
{
  "id": "aaa_project",
  "name": "AAA 项目",
  "description": "AAA 3D Tiles 单体化场景",
  "buildings": [
    {
      "id": "aaa_building1",
      "name": "行政楼",
      "tilesetUrl": "/aaa/3dtiles/tileset.json",
      "monomerization": {
        "manual": {
          "center": { "x": -1956535.307779435, "y": 4458537.970092707, "z": 4107633.2496366594 },
          "dimensions": { "length": 55, "width": 23, "height": 150 },
          "rotation": { "heading": -0.1, "pitch": 0, "roll": 0 },
          "offset": { "x": -3, "y": 0, "z": 0 }
        },
        "style": { "color": "#3498db", "alpha": 0.6 }
      },
      "marker": {
        "longitude": 113.69325445193391,
        "latitude": 40.34206751103671,
        "height": 970
      },
      "info": {
        "简介": "阳高行政楼"
      },
      "customData": {
        "buildingCode": "AAA-001",
        "buildingType": "office",
        "floor": 20,
        "area": 5000,
        "department": "行政部",
        "constructionYear": 2020,
        "manager": "张三",
        "phone": "138-0000-0000",
        "apiEndpoint": "/api/buildings/detail",
        "extraParams": {
          "region": "north",
          "zone": "A"
        }
      }
    },
    {
      "id": "aaa_building2",
      "name": "研发楼",
      "tilesetUrl": "/aaa/3dtiles/tileset.json",
      "monomerization": {
        "manual": {
          "center": { "x": -1956600.0, "y": 4458500.0, "z": 4107650.0 },
          "dimensions": { "length": 60, "width": 30, "height": 120 },
          "rotation": { "heading": 0, "pitch": 0, "roll": 0 },
          "offset": { "x": 0, "y": 0, "z": 0 }
        },
        "style": { "color": "#e74c3c", "alpha": 0.6 }
      },
      "marker": {
        "longitude": 113.69300000000000,
        "latitude": 40.34200000000000,
        "height": 970
      },
      "info": {
        "简介": "研发中心"
      },
      "customData": {
        "buildingCode": "AAA-002",
        "buildingType": "research",
        "floor": 15,
        "area": 3500,
        "department": "研发部",
        "constructionYear": 2021,
        "manager": "李四",
        "phone": "138-1111-1111",
        "apiEndpoint": "/api/buildings/detail",
        "extraParams": {
          "region": "south",
          "zone": "B"
        }
      }
    }
  ],
  "camera": {
    "longitude": 0,
    "latitude": 0,
    "height": 0,
    "heading": 0,
    "pitch": -90,
    "roll": 0
  }
}
```

## 使用 axios 的示例

如果项目中使用 axios，可以这样写：

```typescript
import axios from 'axios'

const fetchBuildingDetails = async (building: any): Promise<void> => {
  const customData = building.customData
  
  if (!customData) return

  try {
    const response = await axios.post(customData.apiEndpoint, {
      buildingCode: customData.buildingCode,
      buildingType: customData.buildingType,
      floor: customData.floor,
      area: customData.area,
      department: customData.department
    }, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    })

    console.log('✅ API 响应:', response.data)
    handleApiResponse(building, response.data)

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ API 请求失败:', error.response?.data || error.message)
    } else {
      console.error('❌ 未知错误:', error)
    }
  }
}
```

## 总结

1. ✅ 在配置文件中添加 `customData` 字段
2. ✅ 更新 TypeScript 类型定义
3. ✅ 在点击事件中获取建筑配置
4. ✅ 使用 `customData` 中的字段作为 API 参数
5. ✅ 支持 GET/POST 等不同请求方式
6. ✅ 可以根据建筑类型调用不同的 API
7. ✅ 完全配置驱动，无需修改核心代码

## 相关文件

- `public/config/scene_aaa.json` - 配置文件
- `sdk/types/index.ts` - 类型定义
- `src/components/CesiumViewerSDK.vue` - 点击事件处理
- `BUILDING_CLICK_LOGIC.md` - 点击逻辑说明
