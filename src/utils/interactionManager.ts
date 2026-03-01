import * as Cesium from 'cesium'
import type { BuildingConfig, LayerConfig } from '../types/building'
import { buildingConfigs, layerConfigs } from '../config/buildings'
import { HighlightManager } from './highlightManager'
import { BuildingManager } from './buildingManager'
import { logger } from './logger'

/**
 * 交互管理器
 */
export class InteractionManager {
  private viewer: Cesium.Viewer
  private highlightManager: HighlightManager
  private buildingManager: BuildingManager
  private handler: Cesium.ScreenSpaceEventHandler
  private mapMouseDown = false

  constructor(
    viewer: Cesium.Viewer,
    highlightManager: HighlightManager,
    buildingManager: BuildingManager
  ) {
    this.viewer = viewer
    this.highlightManager = highlightManager
    this.buildingManager = buildingManager
    this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    this.setupInteractions()
  }

  /**
   * 设置所有交互
   */
  private setupInteractions(): void {
    this.setupMouseEvents()
    this.setupKeyboardEvents()
    this.setupClickEvents()
  }

  /**
   * 设置鼠标事件
   */
  private setupMouseEvents(): void {
    const canvas = this.viewer.scene.canvas as HTMLCanvasElement

    // 鼠标滚轮缩放
    canvas.addEventListener('wheel', (event: WheelEvent) => {
      event.preventDefault()
      this.handleZoom(event.deltaY, event.clientX, event.clientY)
    }, { passive: false })

    // 禁用右键菜单
    canvas.addEventListener('contextmenu', (event: MouseEvent) => {
      event.preventDefault()
    })

    // 鼠标移动
    this.handler.setInputAction(() => {
      if (this.mapMouseDown) {
        this.highlightManager.clearAll()
        this.buildingManager.hideAllBuildingInfo(buildingConfigs)
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    // 鼠标按下
    this.handler.setInputAction(() => {
      this.mapMouseDown = true
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN)

    // 鼠标弹起
    this.handler.setInputAction(() => {
      this.mapMouseDown = false
    }, Cesium.ScreenSpaceEventType.LEFT_UP)
  }

  /**
   * 设置键盘事件
   */
  private setupKeyboardEvents(): void {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key.toUpperCase() === 'R') {
        this.resetView()
      }
    })
  }

  /**
   * 设置点击事件
   */
  private setupClickEvents(): void {
    this.handler.setInputAction((click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      this.handleClick(click)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    // 禁用双击缩放
    this.viewer.screenSpaceEventHandler.removeInputAction(
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    )
  }

  /**
   * 处理点击事件
   */
  private handleClick(click: Cesium.ScreenSpaceEventHandler.PositionedEvent): void {
    logger.log('🖱️ 鼠标点击事件触发')

    const pickedObject = this.viewer.scene.pick(click.position)

    if (Cesium.defined(pickedObject)) {
      this.handlePickedObject(pickedObject, click.position)
    } else {
      this.handleEmptyClick()
    }
  }

  /**
   * 处理点击到的对象
   */
  private handlePickedObject(
    pickedObject: any,
    position: Cesium.Cartesian2
  ): void {
    logger.log('✅ 点击到了物体')

    // 打印点击位置坐标
    const pickPosition = this.viewer.scene.pickPosition(position)
    if (Cesium.defined(pickPosition)) {
      const cartographic = Cesium.Cartographic.fromCartesian(pickPosition)
      const longitude = Cesium.Math.toDegrees(cartographic.longitude)
      const latitude = Cesium.Math.toDegrees(cartographic.latitude)
      const height = cartographic.height

      logger.log('🎯 点击位置坐标:', {
        经度: longitude.toFixed(15),
        纬度: latitude.toFixed(15),
        高度: height.toFixed(2)
      })
    }

    // 检查是否点击了实体
    if (pickedObject.id && pickedObject.id.name) {
      this.handleEntityClick(pickedObject.id.name, pickedObject.id)
    } else {
      this.handleEmptyClick()
    }
  }

  /**
   * 处理实体点击
   */
  private handleEntityClick(name: string, entityId: any): void {
    try {
      const modelData = JSON.parse(name)

      if (modelData.cesiumType === 'cylinderBuilding') {
        const buildingId = modelData.buildingId || 'building1'
        logger.log('🏢 点击的楼栋ID:', buildingId)

        const buildingConfig = buildingConfigs.find(config => config.id === buildingId)
        if (buildingConfig) {
          this.highlightBuilding(buildingConfig)
        } else {
          logger.warn(`⚠️ 未找到楼栋ID: ${buildingId} 的配置`)
        }
      } else if (modelData.cesiumType === 'boxFlood') {
        const layerId = entityId.id
        const layerConfig = layerConfigs.find(config => config.id === layerId)
        if (layerConfig) {
          this.highlightLayer(layerConfig)
        }
      }
    } catch (error) {
      logger.error('解析模型数据失败:', error)
      this.handleEmptyClick()
    }
  }

  /**
   * 处理空白点击
   */
  private handleEmptyClick(): void {
    logger.log('🖱️ 点击了空白区域')
    this.highlightManager.clearAll()
    this.buildingManager.hideAllBuildingInfo(buildingConfigs)
  }

  /**
   * 高亮楼栋
   */
  private highlightBuilding(config: BuildingConfig): void {
    this.buildingManager.hideAllBuildingInfo(buildingConfigs)
    this.highlightManager.createBuildingHighlight(config)
    this.buildingManager.showBuildingInfo(config.id)
  }

  /**
   * 高亮分层
   */
  private highlightLayer(layerConfig: LayerConfig): void {
    this.highlightManager.createLayerHighlight(layerConfig)
  }

  /**
   * 处理缩放
   */
  private handleZoom(wheelDelta: number, clientX: number, clientY: number): void {
    const camera = this.viewer.camera
    const zoomSpeed = 0.1

    let zoomTarget: Cesium.Cartesian3

    const mousePosition = new Cesium.Cartesian2(clientX, clientY)
    const pickPosition = this.viewer.scene.pickPosition(mousePosition)

    if (Cesium.defined(pickPosition)) {
      zoomTarget = pickPosition
    } else {
      const primitives = this.viewer.scene.primitives
      if (primitives.length > 0) {
        const tileset = primitives.get(0) as Cesium.Cesium3DTileset
        const boundingSphere = tileset.boundingSphere
        if (boundingSphere) {
          zoomTarget = boundingSphere.center
        } else {
          return
        }
      } else {
        return
      }
    }

    const targetToCamera = Cesium.Cartesian3.subtract(
      camera.position,
      zoomTarget,
      new Cesium.Cartesian3()
    )

    const distance = Cesium.Cartesian3.magnitude(targetToCamera)
    const zoomFactor = wheelDelta > 0 ? 1 + zoomSpeed : 1 - zoomSpeed
    const newDistance = distance * zoomFactor
    const clampedDistance = Cesium.Math.clamp(newDistance, 10, 10000)

    const direction = Cesium.Cartesian3.normalize(targetToCamera, new Cesium.Cartesian3())
    const newPosition = Cesium.Cartesian3.add(
      zoomTarget,
      Cesium.Cartesian3.multiplyByScalar(direction, clampedDistance, new Cesium.Cartesian3()),
      new Cesium.Cartesian3()
    )

    camera.position = newPosition
  }

  /**
   * 重置视图
   */
  private async resetView(): Promise<void> {
    try {
      const primitives = this.viewer.scene.primitives
      if (primitives.length > 0) {
        const tileset = primitives.get(0)
        await this.viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0, -90, 0))
      }
    } catch (error) {
      logger.error('重置视图失败:', error)
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.handler.destroy()
  }
}
