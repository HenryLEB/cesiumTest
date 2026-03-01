import * as Cesium from 'cesium'
import type { 
  SceneConfig, 
  BuildingConfig, 
  SDKOptions,
  MonomerizationConfig 
} from '../types'
import { SceneManager } from './SceneManager'
import { HighlightManager } from './HighlightManager'
import { MarkerManager } from './MarkerManager'
import { ConfigLoader } from './ConfigLoader'
import { EventEmitter } from './EventEmitter'

/**
 * Cesium 3D Tiles 单体化 SDK
 * 
 * @example
 * ```typescript
 * const sdk = new MonomerizationSDK(viewer, { debug: true })
 * await sdk.loadSceneFromFile('/config/scene.json')
 * await sdk.createAllHighlights()
 * ```
 */
export class MonomerizationSDK extends EventEmitter {
  private options: Required<SDKOptions>
  private sceneManager: SceneManager
  private highlightManager: HighlightManager
  private markerManager: MarkerManager
  private configLoader: ConfigLoader

  constructor(viewer: Cesium.Viewer, options: SDKOptions = {}) {
    super()
    
    this.options = {
      debug: options.debug ?? false,
      autoLoadMarkers: options.autoLoadMarkers ?? true,
      modelMatrix: options.modelMatrix ?? this.createDefaultModelMatrix()
    }

    // 初始化管理器
    this.sceneManager = new SceneManager(viewer, this.options.modelMatrix)
    this.highlightManager = new HighlightManager(viewer)
    this.markerManager = new MarkerManager(viewer)
    this.configLoader = new ConfigLoader()

    this.log('SDK 初始化完成')
  }

  /**
   * 从配置对象加载场景
   */
  async loadSceneFromConfig(config: SceneConfig): Promise<void> {
    this.log('从配置对象加载场景:', config.name)

    // 验证配置
    this.configLoader.validateSceneConfig(config)

    // 注册场景
    this.sceneManager.registerScene(config)

    // 加载场景
    await this.sceneManager.loadScene(config.id)

    // 自动加载标记
    if (this.options.autoLoadMarkers) {
      this.loadMarkers(config)
    }

    this.emit('sceneLoaded', config)
    this.log('场景加载完成:', config.name)
  }

  /**
   * 从 JSON 文件加载场景
   */
  async loadSceneFromFile(url: string): Promise<void> {
    this.log('从文件加载场景:', url)

    const config = await this.configLoader.loadFromFile(url)
    await this.loadSceneFromConfig(config)
  }

  /**
   * 从 URL 加载场景（支持远程配置）
   */
  async loadSceneFromUrl(url: string): Promise<void> {
    this.log('从 URL 加载场景:', url)

    const config = await this.configLoader.loadFromUrl(url)
    await this.loadSceneFromConfig(config)
  }

  /**
   * 切换场景
   */
  async loadScene(sceneId: string): Promise<void> {
    this.log('切换场景:', sceneId)

    // 清除当前高亮和标记
    this.clearAllHighlights()
    this.markerManager.clearAll()

    // 加载新场景
    await this.sceneManager.loadScene(sceneId)

    // 重新加载标记
    const scene = this.sceneManager.getCurrentScene()
    if (scene && this.options.autoLoadMarkers) {
      this.loadMarkers(scene)
    }

    this.emit('sceneChanged', sceneId)
    this.log('场景切换完成:', sceneId)
  }

  /**
   * 为指定楼栋创建单体化高亮
   */
  async createHighlight(buildingId: string): Promise<void> {
    const scene = this.sceneManager.getCurrentScene()
    if (!scene) {
      throw new Error('没有加载的场景')
    }

    const building = scene.buildings.find((b: BuildingConfig) => b.id === buildingId)
    if (!building) {
      throw new Error(`楼栋不存在: ${buildingId}`)
    }

    this.log('创建高亮:', buildingId)

    // 转换配置格式
    const config = this.convertToMonomerizationConfig(building)

    // 获取元数据（如果是自动检测模式）
    let metadata
    if (config.autoDetect) {
      const tileset = this.sceneManager.getLoadedTileset(buildingId)
      if (tileset) {
        metadata = {
          boundingSphere: {
            center: {
              x: tileset.boundingSphere.center.x,
              y: tileset.boundingSphere.center.y,
              z: tileset.boundingSphere.center.z
            },
            radius: tileset.boundingSphere.radius
          }
        }
      }
    }

    // 创建高亮
    await this.highlightManager.createHighlight(buildingId, config, metadata)

    this.emit('highlightCreated', buildingId)
    this.log('高亮创建完成:', buildingId)
  }

  /**
   * 为所有楼栋创建单体化高亮
   */
  async createAllHighlights(): Promise<void> {
    const scene = this.sceneManager.getCurrentScene()
    if (!scene) {
      throw new Error('没有加载的场景')
    }

    this.log('创建所有高亮')

    for (const building of scene.buildings) {
      await this.createHighlight(building.id)
    }

    this.log('所有高亮创建完成')
  }

  /**
   * 清除指定高亮
   */
  clearHighlight(buildingId: string): void {
    this.log('清除高亮:', buildingId)
    this.highlightManager.clearHighlight(buildingId)
    this.emit('highlightCleared', buildingId)
  }

  /**
   * 清除所有高亮
   */
  clearAllHighlights(): void {
    this.log('清除所有高亮')
    this.highlightManager.clearAll()
    this.emit('allHighlightsCleared')
  }

  /**
   * 显示楼栋信息
   */
  showBuildingInfo(buildingId: string): void {
    this.markerManager.showInfo(buildingId)
  }

  /**
   * 隐藏楼栋信息
   */
  hideBuildingInfo(buildingId: string): void {
    this.markerManager.hideInfo(buildingId)
  }

  /**
   * 获取当前场景
   */
  getCurrentScene(): SceneConfig | null {
    return this.sceneManager.getCurrentScene()
  }

  /**
   * 获取所有场景
   */
  getAllScenes(): SceneConfig[] {
    return this.sceneManager.getAllScenes()
  }

  /**
   * 获取高亮信息
   */
  getHighlight(buildingId: string) {
    return this.highlightManager.getHighlight(buildingId)
  }

  /**
   * 获取所有高亮
   */
  getAllHighlights() {
    return this.highlightManager.getAllHighlights()
  }

  /**
   * 销毁 SDK
   */
  destroy(): void {
    this.log('销毁 SDK')

    this.sceneManager.destroy()
    this.highlightManager.destroy()
    this.markerManager.destroy()

    this.removeAllListeners()

    this.log('SDK 已销毁')
  }

  /**
   * 加载标记
   */
  private loadMarkers(scene: SceneConfig): void {
    scene.buildings.forEach(building => {
      if (building.marker) {
        this.markerManager.addMarker(building)
      }
    })
  }

  /**
   * 转换为单体化配置格式
   */
  private convertToMonomerizationConfig(building: BuildingConfig): MonomerizationConfig {
    return building.monomerization
  }

  /**
   * 创建默认模型矩阵
   */
  private createDefaultModelMatrix(): Cesium.Matrix4 {
    const translation = Cesium.Cartesian3.fromArray([0, 0, -170])
    return Cesium.Matrix4.fromTranslation(translation)
  }

  /**
   * 日志输出
   */
  private log(...args: any[]): void {
    if (this.options.debug) {
      console.log('[MonomerizationSDK]', ...args)
    }
  }
}
