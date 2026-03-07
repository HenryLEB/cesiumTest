/**
 * 自定义字段使用示例
 * 
 * 这个文件展示了如何在 CesiumViewerSDK.vue 中使用自定义字段发送 API 请求
 */

import type { BuildingConfig } from '../sdk/types'

/**
 * 示例 1: 基础 API 请求
 * 
 * 在 handleClick() 函数中添加以下代码：
 */
const example1_basicApiRequest = async (building: BuildingConfig): Promise<void> => {
  const customData = building.customData
  
  if (!customData) {
    console.warn('建筑没有自定义数据')
    return
  }

  console.log('📡 发送 API 请求')
  console.log('建筑编码:', customData.buildingCode)
  console.log('建筑类型:', customData.buildingType)

  try {
    // GET 请求
    const url = `${customData.apiEndpoint}?code=${customData.buildingCode}`
    const response = await fetch(url)
    const data = await response.json()
    
    console.log('✅ API 响应:', data)
  } catch (error) {
    console.error('❌ API 请求失败:', error)
  }
}

/**
 * 示例 2: POST 请求发送所有自定义字段
 */
const example2_postRequest = async (building: BuildingConfig): Promise<void> => {
  const customData = building.customData
  
  if (!customData) return

  try {
    const response = await fetch(customData.apiEndpoint || '/api/buildings/detail', {
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
        // 包含所有额外参数
        ...customData.extraParams,
        // 添加时间戳
        timestamp: new Date().toISOString()
      })
    })

    const data = await response.json()
    console.log('✅ 响应数据:', data)
    
    // 处理响应
    handleApiResponse(building, data)
  } catch (error) {
    console.error('❌ 请求失败:', error)
  }
}

/**
 * 示例 3: 根据建筑类型调用不同 API
 */
const example3_typeBasedApi = async (building: BuildingConfig): Promise<void> => {
  const customData = building.customData
  
  if (!customData) return

  console.log('📡 根据建筑类型:', customData.buildingType)

  switch (customData.buildingType) {
    case 'office':
      await fetchOfficeData(customData)
      break
    case 'research':
      await fetchResearchData(customData)
      break
    case 'residential':
      await fetchResidentialData(customData)
      break
    default:
      await fetchGeneralData(customData)
  }
}

// 办公楼 API
const fetchOfficeData = async (customData: any): Promise<void> => {
  const response = await fetch('/api/office/details', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      buildingCode: customData.buildingCode,
      department: customData.department,
      floor: customData.floor
    })
  })
  const data = await response.json()
  console.log('🏢 办公楼数据:', data)
}

// 研发楼 API
const fetchResearchData = async (customData: any): Promise<void> => {
  const response = await fetch('/api/research/details', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      buildingCode: customData.buildingCode,
      area: customData.area
    })
  })
  const data = await response.json()
  console.log('🔬 研发楼数据:', data)
}

// 住宅楼 API
const fetchResidentialData = async (customData: any): Promise<void> => {
  const response = await fetch('/api/residential/details', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      buildingCode: customData.buildingCode,
      manager: customData.manager,
      phone: customData.phone
    })
  })
  const data = await response.json()
  console.log('🏠 住宅楼数据:', data)
}

// 通用 API
const fetchGeneralData = async (customData: any): Promise<void> => {
  const response = await fetch('/api/buildings/details', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customData)
  })
  const data = await response.json()
  console.log('📋 通用数据:', data)
}

/**
 * 示例 4: 并行请求多个 API
 */
const example4_parallelRequests = async (building: BuildingConfig): Promise<void> => {
  const customData = building.customData
  
  if (!customData) return

  try {
    // 同时请求多个 API
    const [detailsData, statsData, historyData] = await Promise.all([
      fetch(`/api/buildings/details?code=${customData.buildingCode}`).then(r => r.json()),
      fetch(`/api/buildings/stats?code=${customData.buildingCode}`).then(r => r.json()),
      fetch(`/api/buildings/history?code=${customData.buildingCode}`).then(r => r.json())
    ])

    console.log('📊 详细信息:', detailsData)
    console.log('📈 统计数据:', statsData)
    console.log('📜 历史记录:', historyData)

    // 合并数据
    const combinedData = {
      ...detailsData,
      stats: statsData,
      history: historyData
    }

    handleApiResponse(building, combinedData)
  } catch (error) {
    console.error('❌ 并行请求失败:', error)
  }
}

/**
 * 示例 5: 带错误处理和重试的请求
 */
const example5_withRetry = async (
  building: BuildingConfig,
  maxRetries: number = 3
): Promise<void> => {
  const customData = building.customData
  
  if (!customData) return

  let retries = 0

  while (retries < maxRetries) {
    try {
      const response = await fetch(customData.apiEndpoint || '/api/buildings/detail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buildingCode: customData.buildingCode,
          buildingType: customData.buildingType
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ 请求成功:', data)
      handleApiResponse(building, data)
      return // 成功，退出

    } catch (error) {
      retries++
      console.warn(`⚠️ 请求失败 (${retries}/${maxRetries}):`, error)

      if (retries >= maxRetries) {
        console.error('❌ 达到最大重试次数，请求失败')
        // 显示错误提示
        alert(`无法获取建筑 ${building.name} 的详细信息`)
      } else {
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, 1000 * retries))
      }
    }
  }
}

/**
 * 示例 6: 使用 extraParams 传递额外参数
 */
const example6_extraParams = async (building: BuildingConfig): Promise<void> => {
  const customData = building.customData
  
  if (!customData) return

  try {
    const response = await fetch(customData.apiEndpoint || '/api/buildings/detail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // 基础字段
        buildingCode: customData.buildingCode,
        buildingType: customData.buildingType,
        
        // 展开所有额外参数
        ...customData.extraParams,
        
        // 添加运行时参数
        requestTime: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`
      })
    })

    const data = await response.json()
    console.log('✅ 响应:', data)
  } catch (error) {
    console.error('❌ 请求失败:', error)
  }
}

/**
 * 处理 API 响应
 */
const handleApiResponse = (building: BuildingConfig, data: any): void => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 API 响应处理')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🏢 建筑:', building.name)
  console.log('📦 数据:', data)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // 可以在这里：
  // 1. 更新 UI
  // 2. 显示弹窗
  // 3. 更新信息面板
  // 4. 触发其他事件
  
  // 示例：显示自定义信息
  const message = `
    建筑名称: ${building.name}
    建筑编码: ${building.customData?.buildingCode}
    楼层数: ${data.floors || building.customData?.floor}
    使用率: ${data.occupancyRate || 'N/A'}
  `
  
  console.log(message)
}

/**
 * 完整的点击处理函数示例
 * 
 * 将这段代码添加到 src/components/CesiumViewerSDK.vue 的 handleClick() 函数中
 */
const completeClickHandler = `
const handleClick = (click: Cesium.ScreenSpaceEventHandler.PositionedEvent): void => {
  if (!viewer.value || !sdk) return

  const pickedObject = viewer.value.scene.pick(click.position)

  // ... 坐标日志代码 ...

  if (Cesium.defined(pickedObject)) {
    if (pickedObject.id && pickedObject.id.name) {
      try {
        const modelData = JSON.parse(pickedObject.id.name)

        if (modelData.cesiumType === 'buildingMarker' || modelData.cesiumType === 'cylinderBuilding') {
          const buildingId = modelData.buildingId
          
          // 获取建筑配置
          const scene = sdk.getCurrentScene()
          const building = scene?.buildings.find(b => b.id === buildingId)

          if (building) {
            const existingHighlight = sdk.getHighlight(buildingId)
            
            if (existingHighlight) {
              sdk.clearHighlight(buildingId)
              sdk.hideBuildingInfo(buildingId)
            } else {
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

// API 请求函数
const fetchBuildingDetails = async (building: any): Promise<void> => {
  const customData = building.customData
  
  if (!customData) return

  console.log('📡 发送 API 请求')
  console.log('建筑编码:', customData.buildingCode)
  console.log('建筑类型:', customData.buildingType)

  try {
    const response = await fetch(customData.apiEndpoint || '/api/buildings/detail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
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
    
  } catch (error) {
    console.error('❌ API 请求失败:', error)
  }
}
`

export {
  example1_basicApiRequest,
  example2_postRequest,
  example3_typeBasedApi,
  example4_parallelRequests,
  example5_withRetry,
  example6_extraParams,
  handleApiResponse,
  completeClickHandler
}
