import * as Cesium from 'cesium'
import { logger } from './logger'

/**
 * 调试辅助工具
 */
export class DebugHelper {
  /**
   * 打印高亮位置信息
   */
  static logHighlightPosition(
    name: string,
    center: Cesium.Cartesian3,
    rotation: { heading: number; pitch: number; roll: number },
    offset: { x: number; y: number; z: number },
    dimensions: { length: number; width: number; height: number }
  ): void {
    // 转换为经纬度
    const cartographic = Cesium.Cartographic.fromCartesian(center)
    const longitude = Cesium.Math.toDegrees(cartographic.longitude)
    const latitude = Cesium.Math.toDegrees(cartographic.latitude)
    const height = cartographic.height

    logger.log(`\n========== ${name} 高亮位置信息 ==========`)
    logger.log('世界坐标 (center):', {
      x: center.x,
      y: center.y,
      z: center.z
    })
    logger.log('经纬度:', {
      longitude: longitude.toFixed(15),
      latitude: latitude.toFixed(15),
      height: height.toFixed(2)
    })
    logger.log('旋转 (rotation):', rotation)
    logger.log('偏移 (offset):', offset)
    logger.log('尺寸 (dimensions):', dimensions)
    logger.log('==========================================\n')
  }

  /**
   * 打印 Tileset 位置信息
   */
  static logTilesetPosition(name: string, tileset: Cesium.Cesium3DTileset): void {
    const boundingSphere = tileset.boundingSphere
    const center = boundingSphere.center
    const cartographic = Cesium.Cartographic.fromCartesian(center)
    const longitude = Cesium.Math.toDegrees(cartographic.longitude)
    const latitude = Cesium.Math.toDegrees(cartographic.latitude)
    const height = cartographic.height

    logger.log(`\n========== ${name} Tileset 位置信息 ==========`)
    logger.log('边界球中心 (boundingSphere.center):', {
      x: center.x,
      y: center.y,
      z: center.z
    })
    logger.log('经纬度:', {
      longitude: longitude.toFixed(15),
      latitude: latitude.toFixed(15),
      height: height.toFixed(2)
    })
    logger.log('边界球半径:', boundingSphere.radius)
    logger.log('模型矩阵 (modelMatrix):', tileset.modelMatrix)
    logger.log('==========================================\n')
  }

  /**
   * 比较两个位置的差异
   */
  static comparePositions(
    name1: string,
    pos1: Cesium.Cartesian3,
    name2: string,
    pos2: Cesium.Cartesian3
  ): void {
    const distance = Cesium.Cartesian3.distance(pos1, pos2)
    const diff = Cesium.Cartesian3.subtract(pos2, pos1, new Cesium.Cartesian3())

    logger.log(`\n========== 位置比较: ${name1} vs ${name2} ==========`)
    logger.log('距离差:', distance.toFixed(2), '米')
    logger.log('坐标差:', {
      dx: diff.x.toFixed(2),
      dy: diff.y.toFixed(2),
      dz: diff.z.toFixed(2)
    })
    logger.log('==========================================\n')
  }

  /**
   * 可视化高亮边界框（用于调试）
   */
  static visualizeBoundingBox(
    viewer: Cesium.Viewer,
    center: Cesium.Cartesian3,
    dimensions: { length: number; width: number; height: number },
    color: string = '#FF0000'
  ): Cesium.Entity {
    return viewer.entities.add({
      position: center,
      box: {
        dimensions: new Cesium.Cartesian3(
          dimensions.length,
          dimensions.width,
          dimensions.height
        ),
        material: Cesium.Color.fromCssColorString(color).withAlpha(0.3),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString(color),
        outlineWidth: 2
      }
    })
  }

  /**
   * 在指定位置添加调试标记
   */
  static addDebugMarker(
    viewer: Cesium.Viewer,
    position: Cesium.Cartesian3,
    label: string,
    color: string = '#FF0000'
  ): Cesium.Entity {
    return viewer.entities.add({
      position: position,
      point: {
        pixelSize: 10,
        color: Cesium.Color.fromCssColorString(color),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2
      },
      label: {
        text: label,
        font: '14pt sans-serif',
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -10),
        fillColor: Cesium.Color.fromCssColorString(color),
        outlineColor: Cesium.Color.BLACK
      }
    })
  }
}
