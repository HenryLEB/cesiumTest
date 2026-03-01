import type { SceneConfig } from '../types/building'
import { buildingConfigs } from './buildings'

/**
 * 场景配置 - 支持多场景切换
 * 每个场景可以有自己的 3D Tiles 模型和单体化配置
 */

// 场景 1: 保利项目（原有项目）
export const scene1: SceneConfig = {
  id: 'scene1',
  name: '保利项目',
  description: '原有的保利项目场景',
  buildings: buildingConfigs,
  camera: {
    longitude: 113.06090721905448,
    latitude: 22.645399902809583,
    height: 1000,
    heading: 0,
    pitch: -90,
    roll: 0
  }
}

// 场景 2: 示例项目（演示如何配置新场景）
export const scene2: SceneConfig = {
  id: 'scene2',
  name: '示例项目',
  description: '演示如何配置新的场景',
  buildings: [
    {
      id: 'example_building1',
      name: '示例楼栋1',
      tilesetUrl: '/3dtiles/tileset.json', // 替换为实际的 tileset 路径
      center: {
        x: -2306928.0,
        y: 5418717.0,
        z: 2440505.0
      },
      dimensions: {
        length: 60,
        width: 50,
        height: 150
      },
      rotation: {
        heading: 0,
        pitch: 0,
        roll: 0
      },
      offset: {
        x: 0,
        y: 0,
        z: 90
      },
      color: '#00FF00',
      marker: {
        longitude: 113.06,
        latitude: 22.64,
        height: 100
      },
      info: {
        powerConsumption: '15000kw-h',
        waterConsumption: '800m³',
        population: '40人'
      }
    }
  ],
  camera: {
    longitude: 113.06,
    latitude: 22.64,
    height: 800,
    heading: 0,
    pitch: -90,
    roll: 0
  }
}

// 导出所有场景
export const allScenes: SceneConfig[] = [scene1, scene2]

// 默认场景
export const defaultScene = scene1
