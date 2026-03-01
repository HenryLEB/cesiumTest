import * as Cesium from 'cesium'
import type { BuildingConfig } from '../types'

/**
 * 标记管理器
 * 负责管理楼栋标记和信息标签
 */
export class MarkerManager {
  private viewer: Cesium.Viewer
  private markers: Map<string, Cesium.Entity> = new Map()
  private infoLabels: Map<string, Cesium.Entity> = new Map()
  private cylinders: Map<string, Cesium.Entity> = new Map()

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer
  }

  /**
   * 添加楼栋标记
   */
  addMarker(building: BuildingConfig): void {
    if (!building.marker) return

    const { longitude, latitude, height } = building.marker
    const markerPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, height)

    // 添加点标记
    const marker = this.viewer.entities.add({
      id: `${building.id}_marker`,
      name: JSON.stringify({ cesiumType: 'buildingMarker', buildingId: building.id }),
      position: markerPosition,
      point: {
        pixelSize: building.marker.style?.pointSize || 15,
        color: Cesium.Color.fromCssColorString(building.marker.style?.pointColor || '#FFFF00'),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 3,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 500)
      },
      label: {
        text: `🏢 ${building.name}`,
        font: building.marker.style?.labelFont || '16pt sans-serif',
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.TOP,
        pixelOffset: new Cesium.Cartesian2(0, -25),
        fillColor: Cesium.Color.fromCssColorString(building.marker.style?.labelColor || '#FFFF00'),
        outlineColor: Cesium.Color.BLACK,
        showBackground: true,
        backgroundColor: Cesium.Color.BLACK.withAlpha(0.7),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 500)
      }
    })

    this.markers.set(building.id, marker)

    // 添加透明圆柱体作为点击区域
    this.addCylinderEntity(building)

    // 添加信息标签
    if (building.info) {
      this.addInfoLabel(building)
    }
  }

  /**
   * 添加透明圆柱体作为点击区域
   */
  private addCylinderEntity(building: BuildingConfig): void {
    if (!building.marker) return

    const { longitude, latitude, height } = building.marker

    const cylinder = this.viewer.entities.add({
      id: `${building.id}_cylinder`,
      name: JSON.stringify({ cesiumType: 'cylinderBuilding', buildingId: building.id }),
      position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height - 20),
      orientation: Cesium.Transforms.headingPitchRollQuaternion(
        Cesium.Cartesian3.fromDegrees(longitude, latitude, height - 20),
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

    this.cylinders.set(building.id, cylinder)
  }

  /**
   * 添加信息标签
   */
  private addInfoLabel(building: BuildingConfig): void {
    if (!building.marker || !building.info) return

    const { longitude, latitude, height } = building.marker
    const infoPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, height + 10)

    // 格式化信息文本
    const infoText = Object.entries(building.info)
      .map(([key, value]) => `${this.formatKey(key)}：${value}`)
      .join('\n')

    const infoLabel = this.viewer.entities.add({
      id: `${building.id}_info`,
      name: JSON.stringify({ cesiumType: 'buildingInfo', buildingId: building.id }),
      position: infoPosition,
      label: {
        text: infoText,
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
        show: false, // 初始隐藏
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 500),
        translucencyByDistance: new Cesium.NearFarScalar(0, 1.0, 1000, 0.5),
        pixelOffsetScaleByDistance: new Cesium.NearFarScalar(0, 1.0, 1000, 0.5)
      }
    })

    this.infoLabels.set(building.id, infoLabel)
  }

  /**
   * 显示信息标签
   */
  showInfo(buildingId: string): void {
    const infoLabel = this.infoLabels.get(buildingId)
    if (infoLabel) {
      (infoLabel as any).label.show = true
    }
  }

  /**
   * 隐藏信息标签
   */
  hideInfo(buildingId: string): void {
    const infoLabel = this.infoLabels.get(buildingId)
    if (infoLabel) {
      (infoLabel as any).label.show = false
    }
  }

  /**
   * 隐藏所有信息标签
   */
  hideAllInfo(): void {
    this.infoLabels.forEach(label => {
      (label as any).label.show = false
    })
  }

  /**
   * 移除标记
   */
  removeMarker(buildingId: string): void {
    const marker = this.markers.get(buildingId)
    if (marker) {
      this.viewer.entities.remove(marker)
      this.markers.delete(buildingId)
    }

    const cylinder = this.cylinders.get(buildingId)
    if (cylinder) {
      this.viewer.entities.remove(cylinder)
      this.cylinders.delete(buildingId)
    }

    const infoLabel = this.infoLabels.get(buildingId)
    if (infoLabel) {
      this.viewer.entities.remove(infoLabel)
      this.infoLabels.delete(buildingId)
    }
  }

  /**
   * 清除所有标记
   */
  clearAll(): void {
    this.markers.forEach(marker => {
      this.viewer.entities.remove(marker)
    })
    this.markers.clear()

    this.cylinders.forEach(cylinder => {
      this.viewer.entities.remove(cylinder)
    })
    this.cylinders.clear()

    this.infoLabels.forEach(label => {
      this.viewer.entities.remove(label)
    })
    this.infoLabels.clear()
  }

  /**
   * 格式化键名
   */
  private formatKey(key: string): string {
    const keyMap: Record<string, string> = {
      powerConsumption: '电耗',
      waterConsumption: '水耗',
      population: '已入住人口',
      buildingArea: '建筑面积'
    }
    return keyMap[key] || key
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.clearAll()
  }
}
