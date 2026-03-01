import * as Cesium from 'cesium'
import { logger } from './logger'

/**
 * 获取模型边界信息
 */
export const getModelInfo = async (tilesetUrl: string) => {
  try {
    const tileset = await Cesium.Cesium3DTileset.fromUrl(tilesetUrl)
    
    const boundingSphere = tileset.boundingSphere
    const cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center)
    const longitude = Cesium.Math.toDegrees(cartographic.longitude)
    const latitude = Cesium.Math.toDegrees(cartographic.latitude)
    const height = cartographic.height
    
    logger.info('📍 模型坐标信息:', {
      经度: longitude,
      纬度: latitude,
      高度: height,
      边界球半径: boundingSphere.radius
    })
    
    return {
      center: {
        x: boundingSphere.center.x,
        y: boundingSphere.center.y,
        z: boundingSphere.center.z
      },
      longitude,
      latitude,
      height,
      radius: boundingSphere.radius
    }
  } catch (error) {
    logger.error('获取模型信息失败:', error)
    return null
  }
}

/**
 * 根据半径计算模型尺寸
 */
export const getModelDimensions = (radius: number) => {
  return {
    length: radius * 2,
    width: radius * 2 * 0.7,
    height: radius * 2.5
  }
}

/**
 * 创建模型矩阵
 */
export const createModelMatrix = (
  center: Cesium.Cartesian3,
  rotation: { heading: number; pitch: number; roll: number },
  offset: { x: number; y: number; z: number }
): Cesium.Matrix4 => {
  const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center)
  const hprRotation = Cesium.Matrix3.fromHeadingPitchRoll(
    new Cesium.HeadingPitchRoll(rotation.heading, rotation.pitch, rotation.roll)
  )
  const hpr = Cesium.Matrix4.fromRotationTranslation(
    hprRotation,
    new Cesium.Cartesian3(offset.x, offset.y, offset.z)
  )
  Cesium.Matrix4.multiply(modelMatrix, hpr, modelMatrix)
  return modelMatrix
}

/**
 * 打印坐标信息（调试用）
 */
export const logCoordinateInfo = (name: string, center: Cesium.Cartesian3) => {
  const cartographic = Cesium.Cartographic.fromCartesian(center)
  const longitude = Cesium.Math.toDegrees(cartographic.longitude)
  const latitude = Cesium.Math.toDegrees(cartographic.latitude)
  const height = cartographic.height
  
  logger.log(`🏢 ${name} 中心经纬度:`, { longitude, latitude, height })
}
