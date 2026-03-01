import type * as Cesium from 'cesium'

// 楼栋配置接口
export interface BuildingConfig {
  id: string
  name: string
  tilesetUrl: string
  center: {
    x: number
    y: number
    z: number
  }
  dimensions: {
    length: number
    width: number
    height: number
  }
  rotation: {
    heading: number
    pitch: number
    roll: number
  }
  offset: {
    x: number
    y: number
    z: number
  }
  color: string
  marker: {
    longitude: number
    latitude: number
    height: number
  }
  info: {
    powerConsumption: string
    waterConsumption: string
    population: string
  }
}

// 分层配置接口
export interface LayerConfig {
  id: string
  name: string
  offset: {
    x: number
    y: number
    z: number
  }
  rotation: {
    heading: number
    pitch: number
    roll: number
  }
  dimensions: {
    length: number
    width: number
    height: number
  }
  color: string
  height: number
}

// 场景配置接口（新增）
export interface SceneConfig {
  id: string
  name: string
  description?: string
  buildings: BuildingConfig[]
  layers?: LayerConfig[]
  camera?: {
    longitude: number
    latitude: number
    height: number
    heading?: number
    pitch?: number
    roll?: number
  }
}

// 单体化配置接口（通用）
export interface MonomerizationConfig {
  // 自动检测模式
  autoDetect?: boolean
  // 手动配置模式
  manual?: {
    center: { x: number; y: number; z: number }
    dimensions: { length: number; width: number; height: number }
    rotation?: { heading: number; pitch: number; roll: number }
    offset?: { x: number; y: number; z: number }
  }
  // 高亮样式
  style?: {
    color: string
    alpha: number
  }
}

// 3D Tiles 元数据接口（用于自动检测）
export interface TilesetMetadata {
  boundingSphere: {
    center: { x: number; y: number; z: number }
    radius: number
  }
  properties?: Record<string, any>
}

// Cesium Viewer 扩展接口
export interface CesiumViewerExtended extends Cesium.Viewer {
  tileset?: Cesium.Cesium3DTileset
  currentScene?: SceneConfig
}

// 单体化结果接口
export interface MonomerizationResult {
  id: string
  primitive: Cesium.ClassificationPrimitive
  config: MonomerizationConfig
  metadata?: TilesetMetadata
}
