import type { SceneConfig, BuildingConfig } from '../types'

/**
 * 配置加载器
 * 负责从各种来源加载和验证配置
 */
export class ConfigLoader {
  /**
   * 从文件加载配置
   */
  async loadFromFile(url: string): Promise<SceneConfig> {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`加载配置文件失败: ${response.statusText}`)
      }
      const config = await response.json()
      this.validateSceneConfig(config)
      return config
    } catch (error) {
      throw new Error(`加载配置文件失败: ${error}`)
    }
  }

  /**
   * 从 URL 加载配置（支持远程配置）
   */
  async loadFromUrl(url: string): Promise<SceneConfig> {
    return this.loadFromFile(url)
  }

  /**
   * 从字符串加载配置
   */
  loadFromString(jsonString: string): SceneConfig {
    try {
      const config = JSON.parse(jsonString)
      this.validateSceneConfig(config)
      return config
    } catch (error) {
      throw new Error(`解析配置字符串失败: ${error}`)
    }
  }

  /**
   * 验证场景配置
   */
  validateSceneConfig(config: any): asserts config is SceneConfig {
    if (!config) {
      throw new Error('配置不能为空')
    }

    if (!config.id || typeof config.id !== 'string') {
      throw new Error('场景配置缺少有效的 id')
    }

    if (!config.name || typeof config.name !== 'string') {
      throw new Error('场景配置缺少有效的 name')
    }

    if (!Array.isArray(config.buildings)) {
      throw new Error('场景配置缺少 buildings 数组')
    }

    config.buildings.forEach((building: any, index: number) => {
      this.validateBuildingConfig(building, index)
    })
  }

  /**
   * 验证楼栋配置
   */
  private validateBuildingConfig(building: any, index: number): asserts building is BuildingConfig {
    const prefix = `楼栋配置 [${index}]`

    if (!building.id || typeof building.id !== 'string') {
      throw new Error(`${prefix} 缺少有效的 id`)
    }

    if (!building.name || typeof building.name !== 'string') {
      throw new Error(`${prefix} 缺少有效的 name`)
    }

    if (!building.tilesetUrl || typeof building.tilesetUrl !== 'string') {
      throw new Error(`${prefix} 缺少有效的 tilesetUrl`)
    }

    if (!building.monomerization) {
      throw new Error(`${prefix} 缺少 monomerization 配置`)
    }

    // 验证单体化配置
    const mono = building.monomerization
    if (!mono.autoDetect && !mono.manual) {
      throw new Error(`${prefix} 单体化配置必须指定 autoDetect 或 manual`)
    }

    if (mono.manual) {
      if (!mono.manual.center || !mono.manual.dimensions) {
        throw new Error(`${prefix} 手动单体化配置缺少 center 或 dimensions`)
      }
    }
  }

  /**
   * 合并配置（用于配置继承）
   */
  mergeConfigs(base: Partial<SceneConfig>, override: Partial<SceneConfig>): SceneConfig {
    return {
      ...base,
      ...override,
      buildings: [
        ...(base.buildings || []),
        ...(override.buildings || [])
      ]
    } as SceneConfig
  }

  /**
   * 导出配置为 JSON 字符串
   */
  exportToString(config: SceneConfig, pretty: boolean = true): string {
    return JSON.stringify(config, null, pretty ? 2 : 0)
  }

  /**
   * 导出配置为文件（浏览器环境）
   */
  exportToFile(config: SceneConfig, filename: string = 'scene.json'): void {
    const jsonString = this.exportToString(config)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    
    URL.revokeObjectURL(url)
  }
}
