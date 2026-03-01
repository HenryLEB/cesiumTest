/**
 * Cesium 3D Tiles 单体化 SDK
 * 
 * @packageDocumentation
 */

// 导出主 SDK 类
export { MonomerizationSDK } from './core/MonomerizationSDK'

// 导出核心类
export { SceneManager } from './core/SceneManager'
export { HighlightManager } from './core/HighlightManager'
export { MarkerManager } from './core/MarkerManager'
export { ConfigLoader } from './core/ConfigLoader'
export { EventEmitter } from './core/EventEmitter'

// 导出类型
export type {
  SDKOptions,
  SceneConfig,
  BuildingConfig,
  MonomerizationConfig,
  MarkerConfig,
  CameraConfig,
  TilesetMetadata,
  MonomerizationResult,
  SDKEventType,
  EventHandler
} from './types'

// 版本信息
export const VERSION = '1.0.0'
