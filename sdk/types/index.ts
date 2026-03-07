import type * as Cesium from 'cesium'

/**
 * SDK 配置选项
 */
export interface SDKOptions {
  /** 是否启用调试模式 */
  debug?: boolean
  /** 是否自动加载标记 */
  autoLoadMarkers?: boolean
  /** 全局模型矩阵 */
  modelMatrix?: Cesium.Matrix4
}

/**
 * 场景配置
 */
export interface SceneConfig {
  /** 场景唯一标识 */
  id: string
  /** 场景名称 */
  name: string
  /** 场景描述 */
  description?: string
  /** 楼栋配置列表 */
  buildings: BuildingConfig[]
  /** 相机配置 */
  camera?: CameraConfig
}

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
  
  /** 自定义数据字段 - 用于 API 请求等扩展功能 */
  customData?: {
    buildingCode?: string      // 建筑编码
    buildingType?: string      // 建筑类型（office, research, residential 等）
    floor?: number             // 楼层数
    area?: number              // 建筑面积（平方米）
    department?: string        // 所属部门
    constructionYear?: number  // 建造年份
    manager?: string           // 负责人
    phone?: string             // 联系电话
    email?: string             // 联系邮箱
    apiEndpoint?: string       // API 端点
    extraParams?: Record<string, any>  // 额外参数
    [key: string]: any         // 允许其他自定义字段
  }
  
  // 兼容旧格式（可选）
  center?: { x: number; y: number; z: number }
  dimensions?: { length: number; width: number; height: number }
  rotation?: { heading: number; pitch: number; roll: number }
  offset?: { x: number; y: number; z: number }
  color?: string
}

/**
 * 单体化配置
 */
export interface MonomerizationConfig {
  /** 自动检测模式 */
  autoDetect?: boolean
  /** 手动配置模式 */
  manual?: {
    center: { x: number; y: number; z: number }
    dimensions: { length: number; width: number; height: number }
    rotation?: { heading: number; pitch: number; roll: number }
    offset?: { x: number; y: number; z: number }
  }
  /** 样式配置 */
  style?: {
    color: string
    alpha: number
  }
}

/**
 * 标记配置
 */
export interface MarkerConfig {
  /** 经度 */
  longitude: number
  /** 纬度 */
  latitude: number
  /** 高度 */
  height: number
  /** 标记样式 */
  style?: {
    pointSize?: number
    pointColor?: string
    labelFont?: string
    labelColor?: string
  }
}

/**
 * 相机配置
 */
export interface CameraConfig {
  /** 经度 */
  longitude: number
  /** 纬度 */
  latitude: number
  /** 高度 */
  height: number
  /** 朝向角 */
  heading?: number
  /** 俯仰角 */
  pitch?: number
  /** 翻滚角 */
  roll?: number
}

/**
 * Tileset 元数据
 */
export interface TilesetMetadata {
  boundingSphere: {
    center: { x: number; y: number; z: number }
    radius: number
  }
  properties?: Record<string, any>
}

/**
 * 单体化结果
 */
export interface MonomerizationResult {
  id: string
  primitive: Cesium.ClassificationPrimitive
  config: MonomerizationConfig
  metadata?: TilesetMetadata
}

/**
 * 分层配置接口
 */
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

/**
 * 事件类型
 */
export type SDKEventType = 
  | 'sceneLoaded'
  | 'sceneChanged'
  | 'highlightCreated'
  | 'highlightCleared'
  | 'allHighlightsCleared'
  | 'markerAdded'
  | 'markerRemoved'
  | 'error'

/**
 * 事件处理器
 */
export type EventHandler = (...args: any[]) => void
