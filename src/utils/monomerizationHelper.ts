import * as Cesium from 'cesium'
import type { MonomerizationConfig, TilesetMetadata } from '../types/building'
import { logger } from './logger'

/**
 * 单体化辅助工具 - 提供通用的单体化功能
 */
export class MonomerizationHelper {
  /**
   * 从 Tileset URL 自动生成单体化配置
   */
  static async autoGenerateConfig(
    tilesetUrl: string,
    options?: {
      color?: string
      alpha?: number
      scaleFactor?: { length: number; width: number; height: number }
    }
  ): Promise<MonomerizationConfig | null> {
    try {
      const metadata = await this.getTilesetMetadata(tilesetUrl)
      if (!metadata) return null

      // scaleFactor 和 radius 用于未来扩展，暂时保留
      // const scaleFactor = options?.scaleFactor || { length: 2, width: 1.5, height: 2.5 }
      // const radius = metadata.boundingSphere.radius

      return {
        autoDetect: true,
        style: {
          color: options?.color || '#F26419',
          alpha: options?.alpha || 0.6
        }
      }
    } catch (error) {
      logger.error('自动生成单体化配置失败:', error)
      return null
    }
  }

  /**
   * 获取 Tileset 元数据
   */
  static async getTilesetMetadata(tilesetUrl: string): Promise<TilesetMetadata | null> {
    try {
      const tileset = await Cesium.Cesium3DTileset.fromUrl(tilesetUrl)
      const boundingSphere = tileset.boundingSphere

      const metadata: TilesetMetadata = {
        boundingSphere: {
          center: {
            x: boundingSphere.center.x,
            y: boundingSphere.center.y,
            z: boundingSphere.center.z
          },
          radius: boundingSphere.radius
        },
        properties: (tileset as any).properties || {}
      }

      // 清理临时加载的 tileset
      tileset.destroy()

      logger.log('📊 Tileset 元数据:', metadata)
      return metadata
    } catch (error) {
      logger.error('获取 Tileset 元数据失败:', error)
      return null
    }
  }

  /**
   * 从点击位置生成单体化配置
   */
  static generateConfigFromClick(
    clickPosition: Cesium.Cartesian3,
    dimensions: { length: number; width: number; height: number },
    options?: {
      color?: string
      alpha?: number
      rotation?: { heading: number; pitch: number; roll: number }
      offset?: { x: number; y: number; z: number }
    }
  ): MonomerizationConfig {
    return {
      manual: {
        center: {
          x: clickPosition.x,
          y: clickPosition.y,
          z: clickPosition.z
        },
        dimensions,
        rotation: options?.rotation,
        offset: options?.offset
      },
      style: {
        color: options?.color || '#F26419',
        alpha: options?.alpha || 0.6
      }
    }
  }

  /**
   * 从经纬度生成单体化配置
   */
  static generateConfigFromCoordinates(
    longitude: number,
    latitude: number,
    height: number,
    dimensions: { length: number; width: number; height: number },
    options?: {
      color?: string
      alpha?: number
      rotation?: { heading: number; pitch: number; roll: number }
      offset?: { x: number; y: number; z: number }
    }
  ): MonomerizationConfig {
    const position = Cesium.Cartesian3.fromDegrees(longitude, latitude, height)

    return {
      manual: {
        center: {
          x: position.x,
          y: position.y,
          z: position.z
        },
        dimensions,
        rotation: options?.rotation,
        offset: options?.offset
      },
      style: {
        color: options?.color || '#F26419',
        alpha: options?.alpha || 0.6
      }
    }
  }

  /**
   * 计算合适的单体化尺寸
   */
  static calculateDimensions(
    boundingSphereRadius: number,
    scaleFactor?: { length: number; width: number; height: number }
  ): { length: number; width: number; height: number } {
    const factor = scaleFactor || { length: 2, width: 1.5, height: 2.5 }

    return {
      length: boundingSphereRadius * factor.length,
      width: boundingSphereRadius * factor.width,
      height: boundingSphereRadius * factor.height
    }
  }

  /**
   * 验证单体化配置
   */
  static validateConfig(config: MonomerizationConfig): boolean {
    if (config.autoDetect) {
      return true
    }

    if (config.manual) {
      const { center, dimensions } = config.manual
      
      if (!center || !dimensions) {
        logger.error('❌ 单体化配置缺少必要参数')
        return false
      }

      if (dimensions.length <= 0 || dimensions.width <= 0 || dimensions.height <= 0) {
        logger.error('❌ 单体化尺寸必须大于 0')
        return false
      }

      return true
    }

    logger.error('❌ 单体化配置无效')
    return false
  }

  /**
   * 批量生成单体化配置
   */
  static async batchGenerateConfigs(
    tilesetUrls: string[],
    options?: {
      color?: string
      alpha?: number
      scaleFactor?: { length: number; width: number; height: number }
    }
  ): Promise<Map<string, MonomerizationConfig>> {
    const configs = new Map<string, MonomerizationConfig>()

    for (const url of tilesetUrls) {
      const config = await this.autoGenerateConfig(url, options)
      if (config) {
        configs.set(url, config)
      }
    }

    logger.log(`✅ 批量生成了 ${configs.size} 个单体化配置`)
    return configs
  }

  /**
   * 导出单体化配置为 JSON
   */
  static exportConfig(config: MonomerizationConfig): string {
    return JSON.stringify(config, null, 2)
  }

  /**
   * 从 JSON 导入单体化配置
   */
  static importConfig(json: string): MonomerizationConfig | null {
    try {
      const config = JSON.parse(json) as MonomerizationConfig
      if (this.validateConfig(config)) {
        return config
      }
      return null
    } catch (error) {
      logger.error('导入单体化配置失败:', error)
      return null
    }
  }
}
