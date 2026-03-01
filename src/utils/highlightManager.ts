import * as Cesium from 'cesium'
import type { BuildingConfig, LayerConfig } from '../types/building'
import { createModelMatrix, logCoordinateInfo } from './cesiumHelper'
import { logger } from './logger'

/**
 * 单体化高亮管理器
 */
export class HighlightManager {
  private viewer: Cesium.Viewer
  private buildingHighlight: Cesium.ClassificationPrimitive | null = null
  private layerHighlight: Cesium.ClassificationPrimitive | null = null

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer
  }

  /**
   * 创建楼栋单体化高亮
   */
  createBuildingHighlight(config: BuildingConfig): void {
    this.clearBuildingHighlight()

    const center = new Cesium.Cartesian3(config.center.x, config.center.y, config.center.z)
    logCoordinateInfo(config.name, center)

    const modelMatrix = createModelMatrix(center, config.rotation, config.offset)

    this.buildingHighlight = this.viewer.scene.primitives.add(
      new Cesium.ClassificationPrimitive({
        geometryInstances: new Cesium.GeometryInstance({
          geometry: Cesium.BoxGeometry.fromDimensions({
            vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
            dimensions: new Cesium.Cartesian3(
              config.dimensions.length,
              config.dimensions.width,
              config.dimensions.height
            )
          }),
          modelMatrix: modelMatrix,
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(
              Cesium.Color.fromCssColorString(config.color).withAlpha(0.6)
            ),
            show: new Cesium.ShowGeometryInstanceAttribute(true)
          },
          id: config.id
        }),
        classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
        show: true
      })
    )

    logger.log(`✅ ${config.name} 单体化已创建`)
  }

  /**
   * 创建分层单体化高亮
   */
  createLayerHighlight(layerConfig: LayerConfig): void {
    this.clearLayerHighlight()

    const center = new Cesium.Cartesian3(
      -2306846.095427444,
      5418737.767193025,
      2440539.2209737385
    )

    const modelMatrix = createModelMatrix(center, layerConfig.rotation, layerConfig.offset)

    this.layerHighlight = this.viewer.scene.primitives.add(
      new Cesium.ClassificationPrimitive({
        geometryInstances: new Cesium.GeometryInstance({
          geometry: Cesium.BoxGeometry.fromDimensions({
            vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
            dimensions: new Cesium.Cartesian3(
              layerConfig.dimensions.length,
              layerConfig.dimensions.width,
              layerConfig.dimensions.height
            )
          }),
          modelMatrix: modelMatrix,
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(
              Cesium.Color.fromCssColorString(layerConfig.color).withAlpha(0.3)
            ),
            show: new Cesium.ShowGeometryInstanceAttribute(true)
          },
          id: layerConfig.id
        }),
        classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
        show: true
      })
    )

    logger.log(`✅ 分层单体化已创建: ${layerConfig.name}`)
  }

  /**
   * 清除楼栋高亮
   */
  clearBuildingHighlight(): void {
    if (this.buildingHighlight) {
      try {
        this.viewer.scene.primitives.remove(this.buildingHighlight)
        if (!this.buildingHighlight.isDestroyed()) {
          this.buildingHighlight.destroy()
        }
      } catch (error) {
        logger.warn('移除楼栋单体化对象失败:', error)
      }
      this.buildingHighlight = null
    }
  }

  /**
   * 清除分层高亮
   */
  clearLayerHighlight(): void {
    if (this.layerHighlight) {
      try {
        this.viewer.scene.primitives.remove(this.layerHighlight)
        if (!this.layerHighlight.isDestroyed()) {
          this.layerHighlight.destroy()
        }
      } catch (error) {
        logger.warn('移除分层单体化对象失败:', error)
      }
      this.layerHighlight = null
    }
  }

  /**
   * 清除所有高亮
   */
  clearAll(): void {
    this.clearBuildingHighlight()
    this.clearLayerHighlight()
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.clearAll()
  }
}
