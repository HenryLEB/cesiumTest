import type { BuildingConfig, LayerConfig } from '../types/building'

// 楼栋配置数据
export const buildingConfigs: BuildingConfig[] = [
  {
    id: 'building1',
    name: 'A6栋',
    tilesetUrl: '/保利b3dm/tileset.json',
    center: {
      x: -2306928.4726084634,
      y: 5418717.874638036,
      z: 2440505.7478268957
    },
    dimensions: {
      length: 65,
      width: 50,
      height: 160
    },
    rotation: {
      heading: 0.4,
      pitch: 0,
      roll: 0
    },
    offset: {
      x: -14,
      y: 17,
      z: 93.5
    },
    color: '#F26419',
    marker: {
      longitude: 113.06090721905448,
      latitude: 22.645399902809583,
      height: 85
    },
    info: {
      powerConsumption: '25410kw-h',
      waterConsumption: '1149m³',
      population: '56人'
    }
  },
  {
    id: 'building2',
    name: 'B1栋',
    tilesetUrl: '/保利b3dm/tileset.json',
    center: {
      x: -2306930.0,
      y: 5418720.0,
      z: 2440500.0
    },
    dimensions: {
      length: 55,
      width: 50,
      height: 160
    },
    rotation: {
      heading: 0.4,
      pitch: 0,
      roll: 0
    },
    offset: {
      x: -83,
      y: 50,
      z: 90
    },
    color: '#FF6B6B',
    marker: {
      longitude: 113.060277174873093,
      latitude: 22.645483701548006,
      height: 100
    },
    info: {
      powerConsumption: '18500kw-h',
      waterConsumption: '950m³',
      population: '42人'
    }
  }
]

// 分层配置数据
export const layerConfigs: LayerConfig[] = [
  {
    id: 'first',
    name: '1层',
    offset: { x: 0, y: 7, z: 18.7 },
    rotation: { heading: 0, pitch: 0, roll: 0 },
    dimensions: { length: 65, width: 50, height: 4 },
    color: '#D22809',
    height: 18.7
  },
  {
    id: 'second',
    name: '2层',
    offset: { x: 0, y: 7, z: 23 },
    rotation: { heading: 0, pitch: 0, roll: 0 },
    dimensions: { length: 65, width: 50, height: 4 },
    color: '#2932E1',
    height: 23
  },
  {
    id: 'third',
    name: '3层',
    offset: { x: 0, y: 7, z: 27.3 },
    rotation: { heading: 0, pitch: 0, roll: 0 },
    dimensions: { length: 65, width: 50, height: 4 },
    color: '#40C057',
    height: 27.3
  },
  {
    id: 'four',
    name: '4层',
    offset: { x: 0, y: 7, z: 31.7 },
    rotation: { heading: 0, pitch: 0, roll: 0 },
    dimensions: { length: 65, width: 50, height: 4 },
    color: '#FF6600',
    height: 31.7
  }
]

// 分层楼栋实体数据（用于点击检测）
export const cylinderLayers = [
  { id: 'first', height: 18.7 },
  { id: 'second', height: 23 },
  { id: 'third', height: 27.3 },
  { id: 'four', height: 31.7 }
]
