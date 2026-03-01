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

import type * as Cesium from 'cesium'

// Cesium Viewer 扩展接口
export interface CesiumViewerExtended extends Cesium.Viewer {
  tileset?: Cesium.Cesium3DTileset
}
