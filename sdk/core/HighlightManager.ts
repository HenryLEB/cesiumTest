import * as Cesium from 'cesium'
import type { 
  BuildingConfig, 
  LayerConfig, 
  MonomerizationConfig, 
  MonomerizationResult,
  TilesetMetadata 
} from '../types'
import { logger } from '../utils/logger'
import { DebugHelper } from '../utils/debugHelper'
import { createModelMatrix, logCoordinateInfo } from '../utils/cesiumHelper'

/**
 * 单体化高亮管理器（通用版本）
 */
export class HighlightManager {
  private viewer: Cesium.Viewer
  private highlights: Map<string, MonomerizationResult> = new Map()

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer
  }

  /**
   * 通用单体化方法 - 支持自动检测和手动配置
   */
  async createHighlight(
    id: string,
    config: MonomerizationConfig,
    metadata?: TilesetMetadata
  ): Promise<MonomerizationResult | null> {
    // 清除已存在的高亮
    this.clearHighlight(id)

    let center: Cesium.Cartesian3
    let dimensions: { length: number; width: number; height: number }
    let rotation = { heading: 0, pitch: 0, roll: 0 }
    let offset = { x: 0, y: 0, z: 0 }

    // 自动检测模式
    if (config.autoDetect && metadata) {
      center = new Cesium.Cartesian3(
        metadata.boundingSphere.center.x,
        metadata.boundingSphere.center.y,
        metadata.boundingSphere.center.z
      )
      
      // 根据边界球半径自动计算尺寸
      const radius = metadata.boundingSphere.radius
      dimensions = {
        length: radius * 2,
        width: radius * 1.5,
        height: radius * 2.5
      }

      logger.log(`🤖 自动检测模式 - ID: ${id}`, { center, dimensions, radius })
    }
    // 手动配置模式
    else if (config.manual) {
      center = new Cesium.Cartesian3(
        config.manual.center.x,
        config.manual.center.y,
        config.manual.center.z
      )
      dimensions = config.manual.dimensions
      rotation = config.manual.rotation || rotation
      offset = config.manual.offset || offset

      logger.log(`⚙️ 手动配置模式 - ID: ${id}`, { center, dimensions })
    } else {
      logger.error('❌ 单体化配置无效')
      return null
    }

    // 创建模型矩阵
    const modelMatrix = createModelMatrix(center, rotation, offset)

    // 获取样式配置
    const style = config.style || { color: '#F26419', alpha: 0.6 }

    // 根据 shape 创建不同的几何体
    let geometry: Cesium.Geometry
    const shape = config.manual?.shape || 'box'

    if (shape === 'cylinder') {
      // 圆柱体
      const radius = (dimensions as any).radius || 30
      const height = dimensions.height
      
      geometry = new Cesium.CylinderGeometry({
        length: height,
        topRadius: radius,
        bottomRadius: radius,
        vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT
      })
    } else {
      // 默认长方体
      geometry = Cesium.BoxGeometry.fromDimensions({
        vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
        dimensions: new Cesium.Cartesian3(
          dimensions.length,
          dimensions.width,
          dimensions.height
        )
      })
    }

    // 创建单体化图元
    const primitive = this.viewer.scene.primitives.add(
      new Cesium.ClassificationPrimitive({
        geometryInstances: new Cesium.GeometryInstance({
          geometry: geometry,
          modelMatrix: modelMatrix,
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(
              Cesium.Color.fromCssColorString(style.color).withAlpha(style.alpha)
            ),
            show: new Cesium.ShowGeometryInstanceAttribute(true)
          },
          id: id
        }),
        classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
        show: true
      })
    ) as Cesium.ClassificationPrimitive

    const result: MonomerizationResult = {
      id,
      primitive,
      config,
      metadata
    }

    this.highlights.set(id, result)
    logger.log(`✅ 单体化已创建: ${id}`)

    return result
  }

  /**
   * 创建楼栋单体化高亮（兼容旧接口）
   */
  async createBuildingHighlight(config: BuildingConfig): Promise<MonomerizationResult | null> {
    // 兼容旧格式和新格式
    let center: Cesium.Cartesian3
    let dimensions: { length: number; width: number; height: number }
    let rotation = { heading: 0, pitch: 0, roll: 0 }
    let offset = { x: 0, y: 0, z: 0 }
    let color = '#F26419'

    if (config.center && config.dimensions) {
      // 旧格式
      center = new Cesium.Cartesian3(config.center.x, config.center.y, config.center.z)
      dimensions = config.dimensions
      rotation = config.rotation || rotation
      offset = config.offset || offset
      color = config.color || color
    } else if (config.monomerization?.manual) {
      // 新格式
      const manual = config.monomerization.manual
      center = new Cesium.Cartesian3(manual.center.x, manual.center.y, manual.center.z)
      dimensions = manual.dimensions
      rotation = manual.rotation || rotation
      offset = manual.offset || offset
      color = config.monomerization.style?.color || color
    } else {
      logger.error('❌ 楼栋配置格式无效')
      return null
    }

    logCoordinateInfo(config.name, center)

    // 调试：打印详细位置信息
    if (import.meta.env.DEV) {
      DebugHelper.logHighlightPosition(
        config.name,
        center,
        rotation,
        offset,
        dimensions
      )
    }

    const monomerizationConfig: MonomerizationConfig = {
      manual: {
        center: { x: center.x, y: center.y, z: center.z },
        dimensions,
        rotation,
        offset
      },
      style: {
        color,
        alpha: 0.6
      }
    }

    return await this.createHighlight(config.id, monomerizationConfig)
  }

  /**
   * 创建分层单体化高亮（兼容旧接口）
   */
  async createLayerHighlight(layerConfig: LayerConfig): Promise<MonomerizationResult | null> {
    const center = new Cesium.Cartesian3(
      -2306846.095427444,
      5418737.767193025,
      2440539.2209737385
    )

    const monomerizationConfig: MonomerizationConfig = {
      manual: {
        center: {
          x: center.x,
          y: center.y,
          z: center.z
        },
        dimensions: layerConfig.dimensions,
        rotation: layerConfig.rotation,
        offset: layerConfig.offset
      },
      style: {
        color: layerConfig.color,
        alpha: 0.3
      }
    }

    return await this.createHighlight(layerConfig.id, monomerizationConfig)
  }

  /**
   * 清除指定高亮
   */
  clearHighlight(id: string): void {
    const result = this.highlights.get(id)
    if (result) {
      try {
        this.viewer.scene.primitives.remove(result.primitive)
        if (!result.primitive.isDestroyed()) {
          result.primitive.destroy()
        }
        this.highlights.delete(id)
        logger.log(`🗑️ 高亮已清除: ${id}`)
      } catch (error) {
        logger.warn(`清除高亮失败: ${id}`, error)
      }
    }
  }

  /**
   * 清除楼栋高亮（兼容旧接口）
   */
  clearBuildingHighlight(): void {
    // 清除所有非分层的高亮
    const toRemove: string[] = []
    this.highlights.forEach((_result, id) => {
      if (!id.startsWith('first') && !id.startsWith('second') && 
          !id.startsWith('third') && !id.startsWith('four')) {
        toRemove.push(id)
      }
    })
    toRemove.forEach(id => this.clearHighlight(id))
  }

  /**
   * 清除分层高亮（兼容旧接口）
   */
  clearLayerHighlight(): void {
    // 清除所有分层高亮
    const toRemove: string[] = []
    this.highlights.forEach((_result, id) => {
      if (id.startsWith('first') || id.startsWith('second') || 
          id.startsWith('third') || id.startsWith('four')) {
        toRemove.push(id)
      }
    })
    toRemove.forEach(id => this.clearHighlight(id))
  }

  /**
   * 清除所有高亮
   */
  clearAll(): void {
    const ids = Array.from(this.highlights.keys())
    ids.forEach(id => this.clearHighlight(id))
  }

  /**
   * 获取高亮结果
   */
  getHighlight(id: string): MonomerizationResult | null {
    return this.highlights.get(id) || null
  }

  /**
   * 获取所有高亮
   */
  getAllHighlights(): MonomerizationResult[] {
    return Array.from(this.highlights.values())
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.clearAll()
  }
}
