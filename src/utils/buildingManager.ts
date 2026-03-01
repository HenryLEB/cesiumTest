import * as Cesium from 'cesium'
import type { BuildingConfig } from '../types/building'
import { cylinderLayers } from '../config/buildings'
import { logger } from './logger'

/**
 * 楼栋管理器
 */
export class BuildingManager {
  private viewer: Cesium.Viewer

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer
  }

  /**
   * 加载楼栋 3D Tiles 模型
   */
  async loadBuilding(config: BuildingConfig): Promise<Cesium.Cesium3DTileset | null> {
    logger.log(`🏗️ 开始加载楼栋: ${config.name}`)

    try {
      const translation = Cesium.Cartesian3.fromArray([0, 0, -170])
      const m = Cesium.Matrix4.fromTranslation(translation)

      const tileset = await Cesium.Cesium3DTileset.fromUrl(config.tilesetUrl, {
        modelMatrix: m,
        maximumScreenSpaceError: 64
      })
      
      this.viewer.scene.primitives.add(tileset)
      ;(this.viewer as any).tileset = tileset

      logger.log(`✅ ${config.name} 3D Tiles 模型加载成功`)

      // 定位相机
      this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          config.marker.longitude,
          config.marker.latitude,
          1000
        ),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-90),
          roll: 0
        }
      })

      // 添加楼栋标记
      this.addBuildingMarker(config)

      return tileset
    } catch (error) {
      logger.error(`❌ 加载 ${config.name} 3D Tiles 模型失败:`, error)
      return null
    }
  }

  /**
   * 添加楼栋标记
   */
  addBuildingMarker(config: BuildingConfig): void {
    const markerPosition = Cesium.Cartesian3.fromDegrees(
      config.marker.longitude,
      config.marker.latitude,
      config.marker.height
    )

    // 添加点标记
    this.viewer.entities.add({
      id: `${config.id}_marker`,
      name: JSON.stringify({ cesiumType: 'cylinderBuilding', buildingId: config.id }),
      position: markerPosition,
      point: {
        pixelSize: 15,
        color: Cesium.Color.YELLOW,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 3,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 500)
      },
      label: {
        text: `🏢 ${config.name}`,
        font: '16pt sans-serif',
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.TOP,
        pixelOffset: new Cesium.Cartesian2(0, -25),
        fillColor: Cesium.Color.YELLOW,
        outlineColor: Cesium.Color.BLACK,
        showBackground: true,
        backgroundColor: Cesium.Color.BLACK.withAlpha(0.7),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 500)
      }
    })

    // 添加信息标签
    const infoLabelPosition = Cesium.Cartesian3.fromDegrees(
      config.marker.longitude,
      config.marker.latitude,
      config.marker.height + 10
    )

    this.viewer.entities.add({
      id: `${config.id}_info`,
      name: JSON.stringify({ cesiumType: 'buildingInfo', buildingId: config.id }),
      position: infoLabelPosition,
      label: {
        text: `电耗：${config.info.powerConsumption}\n水耗：${config.info.waterConsumption}\n已入住人口：${config.info.population}`,
        font: '12pt sans-serif',
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -10),
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        showBackground: true,
        backgroundColor: Cesium.Color.fromCssColorString('rgba(0, 0, 0, 0.8)'),
        backgroundPadding: new Cesium.Cartesian2(10, 8),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        scale: 1.0,
        show: false,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 500),
        translucencyByDistance: new Cesium.NearFarScalar(0, 1.0, 1000, 0.5),
        pixelOffsetScaleByDistance: new Cesium.NearFarScalar(0, 1.0, 1000, 0.5)
      }
    })

    logger.log(`📍 ${config.name} 标记已添加`)
  }

  /**
   * 显示楼栋信息标签
   */
  showBuildingInfo(buildingId: string): void {
    const infoLabel = this.viewer.entities.getById(`${buildingId}_info`)
    if (infoLabel) {
      (infoLabel as any).label.show = true
    }
  }

  /**
   * 隐藏所有楼栋信息标签
   */
  hideAllBuildingInfo(buildingConfigs: BuildingConfig[]): void {
    buildingConfigs.forEach(config => {
      const infoLabel = this.viewer.entities.getById(`${config.id}_info`)
      if (infoLabel) {
        (infoLabel as any).label.show = false
      }
    })
  }

  /**
   * 创建楼栋柱体实体
   */
  createCylinderEntities(buildingConfigs: BuildingConfig[]): void {
    buildingConfigs.forEach(config => {
      this.viewer.entities.add({
        id: `${config.id}_cylinder`,
        name: JSON.stringify({ cesiumType: 'cylinderBuilding', buildingId: config.id }),
        position: Cesium.Cartesian3.fromDegrees(
          config.marker.longitude,
          config.marker.latitude,
          config.marker.height - 20
        ),
        orientation: Cesium.Transforms.headingPitchRollQuaternion(
          Cesium.Cartesian3.fromDegrees(
            config.marker.longitude,
            config.marker.latitude,
            config.marker.height - 20
          ),
          new Cesium.HeadingPitchRoll(
            Cesium.Math.toRadians(140),
            Cesium.Math.toRadians(0),
            Cesium.Math.toRadians(0)
          )
        ),
        cylinder: {
          length: 80,
          topRadius: 23,
          bottomRadius: 23,
          material: Cesium.Color.fromCssColorString('rgba(255, 255, 255, 0.01)'),
          slices: 100,
          numberOfVerticalLines: 100
        }
      })
    })
  }

  /**
   * 创建分层实体
   */
  createLayerEntities(): void {
    cylinderLayers.forEach(layer => {
      this.viewer.entities.add({
        id: layer.id,
        name: '{"cesiumType": "boxFlood"}',
        position: Cesium.Cartesian3.fromDegrees(
          113.06025929925363,
          22.645596984482292,
          layer.height
        ),
        orientation: Cesium.Transforms.headingPitchRollQuaternion(
          Cesium.Cartesian3.fromDegrees(
            113.06025929925363,
            22.645596984482292,
            layer.height
          ),
          new Cesium.HeadingPitchRoll(
            Cesium.Math.toRadians(116),
            Cesium.Math.toRadians(0),
            Cesium.Math.toRadians(0)
          )
        ),
        box: {
          dimensions: new Cesium.Cartesian3(20.6, 47, 4),
          material: Cesium.Color.fromCssColorString('rgba(255, 255, 255, 0.01)')
        }
      })
    })
  }
}
