import * as Cesium from 'cesium'
import type { SceneConfig, TilesetMetadata } from '../types'
import { logger } from '../utils/logger'
import { DebugHelper } from '../utils/debugHelper'

/**
 * 场景管理器 - 管理多个场景的加载和切换
 */
export class SceneManager {
  private viewer: Cesium.Viewer
  private modelMatrix: Cesium.Matrix4
  private scenes: Map<string, SceneConfig> = new Map()
  private loadedTilesets: Map<string, Cesium.Cesium3DTileset> = new Map()
  private currentSceneId: string | null = null

  constructor(viewer: Cesium.Viewer, modelMatrix?: Cesium.Matrix4) {
    this.viewer = viewer
    this.modelMatrix = modelMatrix || this.createDefaultModelMatrix()
  }

  /**
   * 创建默认模型矩阵
   */
  private createDefaultModelMatrix(): Cesium.Matrix4 {
    const translation = Cesium.Cartesian3.fromArray([0, 0, -170])
    return Cesium.Matrix4.fromTranslation(translation)
  }

  /**
   * 注册场景配置
   */
  registerScene(scene: SceneConfig): void {
    this.scenes.set(scene.id, scene)
    logger.log(`📋 场景已注册: ${scene.name}`)
  }

  /**
   * 批量注册场景
   */
  registerScenes(scenes: SceneConfig[]): void {
    scenes.forEach(scene => this.registerScene(scene))
  }

  /**
   * 加载场景
   */
  async loadScene(sceneId: string): Promise<void> {
    const scene = this.scenes.get(sceneId)
    if (!scene) {
      logger.error(`❌ 场景不存在: ${sceneId}`)
      return
    }

    logger.log(`🎬 开始加载场景: ${scene.name}`)

    // 清除当前场景
    await this.clearCurrentScene()

    // 加载新场景的所有 3D Tiles
    for (const building of scene.buildings) {
      await this.loadTileset(building.tilesetUrl, building.id)
    }

    // 设置相机位置
    if (scene.camera && scene.camera.longitude !== 0 && scene.camera.latitude !== 0) {
      // 使用配置的相机位置
      this.setCameraPosition(scene.camera)
    } else {
      // 自动定位到第一个 Tileset
      await this.autoPositionCamera()
    }

    this.currentSceneId = sceneId
    ;(this.viewer as any).currentScene = scene

    logger.log(`✅ 场景加载完成: ${scene.name}`)
  }

  /**
   * 加载单个 Tileset
   */
  private async loadTileset(url: string, id: string): Promise<Cesium.Cesium3DTileset | null> {
    try {
      const tileset = await Cesium.Cesium3DTileset.fromUrl(url, {
        modelMatrix: this.modelMatrix,
        maximumScreenSpaceError: 64
      })

      this.viewer.scene.primitives.add(tileset)
      this.loadedTilesets.set(id, tileset)

      // 调试：打印 Tileset 位置信息
      if (import.meta.env.DEV) {
        DebugHelper.logTilesetPosition(id, tileset)
      }

      logger.log(`✅ Tileset 加载成功: ${id}`)
      return tileset
    } catch (error) {
      logger.error(`❌ Tileset 加载失败: ${id}`, error)
      return null
    }
  }

  /**
   * 获取 Tileset 元数据
   */
  async getTilesetMetadata(tilesetUrl: string): Promise<TilesetMetadata | null> {
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

      return metadata
    } catch (error) {
      logger.error('获取 Tileset 元数据失败:', error)
      return null
    }
  }

  /**
   * 设置相机位置
   */
  private setCameraPosition(camera: SceneConfig['camera']): void {
    if (!camera) return

    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        camera.longitude,
        camera.latitude,
        camera.height
      ),
      orientation: {
        heading: Cesium.Math.toRadians(camera.heading || 0),
        pitch: Cesium.Math.toRadians(camera.pitch || -90),
        roll: Cesium.Math.toRadians(camera.roll || 0)
      }
    })
  }

  /**
   * 自动定位相机到模型
   */
  private async autoPositionCamera(): Promise<void> {
    const primitives = this.viewer.scene.primitives
    if (primitives.length > 0) {
      const tileset = primitives.get(0) as Cesium.Cesium3DTileset
      
      // 使用 zoomTo 自动定位，俯视角度
      await this.viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(
        0,      // heading: 0 (正北)
        -1.57,  // pitch: -90度 (俯视)
        0       // range: 自动计算距离
      ))
      
      logger.log('📷 相机已自动定位到模型')
    }
  }

  /**
   * 清除当前场景
   */
  async clearCurrentScene(): Promise<void> {
    // 移除所有已加载的 tilesets
    this.loadedTilesets.forEach((tileset, id) => {
      try {
        this.viewer.scene.primitives.remove(tileset)
        if (!tileset.isDestroyed()) {
          tileset.destroy()
        }
        logger.log(`🗑️ Tileset 已移除: ${id}`)
      } catch (error) {
        logger.warn(`移除 Tileset 失败: ${id}`, error)
      }
    })

    this.loadedTilesets.clear()
    this.currentSceneId = null
    ;(this.viewer as any).currentScene = null
  }

  /**
   * 获取当前场景
   */
  getCurrentScene(): SceneConfig | null {
    if (!this.currentSceneId) return null
    return this.scenes.get(this.currentSceneId) || null
  }

  /**
   * 获取所有场景
   */
  getAllScenes(): SceneConfig[] {
    return Array.from(this.scenes.values())
  }

  /**
   * 获取已加载的 Tileset
   */
  getLoadedTileset(buildingId: string): Cesium.Cesium3DTileset | null {
    return this.loadedTilesets.get(buildingId) || null
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.clearCurrentScene()
    this.scenes.clear()
  }
}
