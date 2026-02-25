<template>
  <div class="cesium-container">
    <div id="cesiumContainer" class="cesium-viewer"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as Cesium from 'cesium'

// 响应式数据
const viewer = ref<Cesium.Viewer | null>(null)
const cameraController = ref<Cesium.ScreenSpaceCameraController | null>(null)
const mapMouseDown = ref(false)

// 全局变量
let tilesModelObj: any = null
let tilesFloodTest: any = null

// 楼栋配置接口
interface BuildingConfig {
  id: string
  name: string
  tilesetUrl: string
  center: {
    x: number
    y: number
    z: number
  }
  dimensions: {
    length: number
    width: number
    height: number
  }
  rotation: {
    heading: number
    pitch: number
    roll: number
  }
  offset: {
    x: number
    y: number
    z: number
  }
  color: string
  marker: {
    longitude: number
    latitude: number
    height: number
  }
  info: {
    powerConsumption: string
    waterConsumption: string
    population: string
  }
}

// 楼栋配置数据
const buildingConfigs: BuildingConfig[] = [
  {
    id: 'building1',
    name: 'A6栋',
    tilesetUrl: '/保利b3dm/tileset.json',
    center: {
      x: -2306928.4726084634,
      y: 5418717.874638036,
      z: 2440505.7478268957
    },
    dimensions: {
      length: 65,
      width: 50,
      height: 160
    },
    rotation: {
      heading: 0.4,
      pitch: 0,
      roll: 0
    },
    offset: {
      x: -14,
      y: 17,
      z: 93.5
    },
    color: '#F26419',
    marker: {
      longitude: 113.06090721905448,
      latitude: 22.645399902809583,
      height: 85
    },
    info: {
      powerConsumption: '25410kw-h',
      waterConsumption: '1149m³',
      population: '56人'
    }
  },
  {
    id: 'building2',
    name: 'B1栋',
    tilesetUrl: '/保利b3dm/tileset.json',
    center: {
      x: -2306930.0,
      y: 5418720.0,
      z: 2440500.0
    },
    dimensions: {
      length: 55,
      width: 50,
      height: 160
    },
    rotation: {
      heading: 0.4,
      pitch: 0,
      roll: 0
    },
    offset: {
      x: -83,
      y: 50,
      z: 90
    },
    color: '#FF6B6B',
    marker: {
      longitude: 113.060277174873093,
      latitude: 22.645483701548006,
      height: 100
    },
    info: {
      powerConsumption: '18500kw-h',
      waterConsumption: '950m³',
      population: '42人'
    }
  }
]

// 当前激活的楼栋
const activeBuildingId = ref<string | null>(null)

// 分层单体化反选数据
const layered = {
  first: {
    priipt1: 0,
    priipt2: 0,
    priipt3: 0,
    priipt4: 0,
    priipt5: 7,
    priipt6: 18.7,
    priipt7: 65,
    priipt8: 50,
    priipt9: 4,
    color: '#D22809'
  },
  second: {
    priipt1: 0,
    priipt2: 0,
    priipt3: 0,
    priipt4: 0,
    priipt5: 7,
    priipt6: 23,
    priipt7: 65,
    priipt8: 50,
    priipt9: 4,
    color: '#2932E1'
  },
  third: {
    priipt1: 0,
    priipt2: 0,
    priipt3: 0,
    priipt4: 0,
    priipt5: 7,
    priipt6: 27.3,
    priipt7: 65,
    priipt8: 50,
    priipt9: 4,
    color: '#40C057'
  },
  four: {
    priipt1: 0,
    priipt2: 0,
    priipt3: 0,
    priipt4: 0,
    priipt5: 7,
    priipt6: 31.7,
    priipt7: 65,
    priipt8: 50,
    priipt9: 4,
    color: '#FF6600'
  }
}

// 分层楼栋实体数据
const cylinders = {
  first: {
    cylinder1: 18.7,
    id: 'first'
  },
  second: {
    cylinder1: 23,
    id: 'second'
  },
  third: {
    cylinder1: 27.3,
    id: 'third'
  },
  four: {
    cylinder1: 31.7,
    id: 'four'
  }
}

// 分层单体化
const layeredTilesModel = (data: 'first' | 'second' | 'third' | 'four') => {
  if (!viewer.value) return
  
  const scene = viewer.value.scene
  
  // 移除已存在的单体化对象
  if (tilesFloodTest) {
    try {
      scene.primitives.remove(tilesFloodTest)
    } catch (error) {
      console.warn('移除分层单体化对象失败:', error)
    }
    tilesFloodTest = null
  }
  
  const center = new Cesium.Cartesian3(
    -2306846.095427444,
    5418737.767193025,
    2440539.2209737385
  )
  
  const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center)
  const hprRotation = Cesium.Matrix3.fromHeadingPitchRoll(
    new Cesium.HeadingPitchRoll(Number(layered[data].priipt1), Number(layered[data].priipt2), Number(layered[data].priipt3))
  )
  
  const hpr = Cesium.Matrix4.fromRotationTranslation(
    hprRotation,
    new Cesium.Cartesian3(Number(layered[data].priipt4), Number(layered[data].priipt5), Number(layered[data].priipt6))
  )
  
  Cesium.Matrix4.multiply(modelMatrix, hpr, modelMatrix)

  tilesFloodTest = scene.primitives.add(
    new Cesium.ClassificationPrimitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: Cesium.BoxGeometry.fromDimensions({
          vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
          dimensions: new Cesium.Cartesian3(Number(layered[data].priipt7), Number(layered[data].priipt8), Number(layered[data].priipt9))
        }),
        modelMatrix: modelMatrix,
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            Cesium.Color.fromCssColorString(layered[data].color).withAlpha(0.3)
          ),
          show: new Cesium.ShowGeometryInstanceAttribute(true)
        },
        id: 'volume 1'
      }),
      classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
      show: true
    })
  )
  
  console.log(`✅ 分层单体化已创建: ${data}`)
}

// 通用楼栋单体化函数
const createBuildingHighlight = (config: BuildingConfig) => {
  if (!viewer.value) return
  
  const scene = viewer.value.scene
  
  // 移除已存在的单体化对象
  if (tilesModelObj) {
    try {
      scene.primitives.remove(tilesModelObj)
    } catch (error) {
      console.warn('移除单体化对象失败:', error)
    }
    tilesModelObj = null
  }
  
  // 隐藏所有楼栋信息标签
  buildingConfigs.forEach(bc => {
    const infoLabel = viewer.value?.entities.getById(`${bc.id}_info`)
    if (infoLabel) {
      (infoLabel as any).label.show = false
    }
  })
  
  // 世界坐标
  const center = new Cesium.Cartesian3(
    config.center.x,
    config.center.y,
    config.center.z
  )
  
  // 将世界坐标转换为经纬度，用于调试
  const cartographic = Cesium.Cartographic.fromCartesian(center)
  const longitude = Cesium.Math.toDegrees(cartographic.longitude)
  const latitude = Cesium.Math.toDegrees(cartographic.latitude)
  const height = cartographic.height
  console.log(`🏢 ${config.name} 单体化中心经纬度:`, { longitude, latitude, height })
  
  // 获取3D Tiles的bounding box信息
  if (viewer.value) {
    const tileset = (viewer.value as any).tileset
    if (tileset && tileset.boundingSphere) {
      const boundingSphere = tileset.boundingSphere
      console.log('📦 3D Tiles边界球:', {
        center: boundingSphere.center,
        radius: boundingSphere.radius
      })
      
      // 计算楼体的近似尺寸（基于边界球半径）
      const approximateSize = boundingSphere.radius * 2
      console.log('📐 楼体近似尺寸:', {
        长度: approximateSize,
        宽度: approximateSize * 0.7,
        高度: approximateSize * 2.5
      })
    }
  }
  
  const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center)
  const hprRotation = Cesium.Matrix3.fromHeadingPitchRoll(
    new Cesium.HeadingPitchRoll(config.rotation.heading, config.rotation.pitch, config.rotation.roll)
  )
  const hpr = Cesium.Matrix4.fromRotationTranslation(
    hprRotation,
    new Cesium.Cartesian3(config.offset.x, config.offset.y, config.offset.z)
  )
  Cesium.Matrix4.multiply(modelMatrix, hpr, modelMatrix)

  tilesModelObj = scene.primitives.add(
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
  
  // 显示楼栋信息标签
  const infoLabel = viewer.value.entities.getById(`${config.id}_info`)
  if (infoLabel) {
    (infoLabel as any).label.show = true
    console.log(`✅ ${config.name} 信息标签已显示`)
  }
  
  console.log(`✅ ${config.name} 单体化已创建`)
  console.log('单体化中心坐标:', center)
  console.log(`单体化尺寸: ${config.dimensions.length} x ${config.dimensions.width} x ${config.dimensions.height}`)
  console.log('单体化是否显示:', tilesModelObj.show)
  console.log('单体化分类类型:', tilesModelObj.classificationType)
  
  // 检查场景中的图元
  console.log('🔍 创建后场景中的图元数量:', scene.primitives.length)
  for (let i = 0; i < scene.primitives.length; i++) {
    const primitive = scene.primitives.get(i)
    console.log(`图元 ${i}:`, primitive.constructor.name)
  }
}

// 通用加载楼栋函数
const loadBuilding = async (config: BuildingConfig) => {
  if (!viewer.value) return
  
  console.log(`🏗️ 开始加载楼栋: ${config.name}`)
  
  try {
    // 添加平移矩阵
    const translation = Cesium.Cartesian3.fromArray([0, 0, -170])
    const m = Cesium.Matrix4.fromTranslation(translation)
    
    // 加载 3D Tiles 模型
    const tileset = await Cesium.Cesium3DTileset.fromUrl(config.tilesetUrl, {
      modelMatrix: m,
      maximumScreenSpaceError: 64
    })
    viewer.value.scene.primitives.add(tileset)
    
    // 保存对tileset的引用
    ;(viewer.value as any).tileset = tileset

    console.log(`✅ ${config.name} 3D Tiles 模型加载成功`)
    console.log('模型URL:', config.tilesetUrl)
    console.log('模型边界球:', tileset.boundingSphere)
    
    // 使用flyTo定位相机到指定视角
    // orientation参数说明：
    // - heading: 相机朝向（方位角），0表示正北，正值向东旋转
    // - pitch: 相机俯仰角，0表示水平，负值向下看，正值向上看
    // - roll: 相机翻滚角，通常设置为0
    // 正视图设置：pitch为-90度表示完全俯视，heading为0表示正北方向
    viewer.value.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        config.marker.longitude,
        config.marker.latitude,
        1000 // 增加高度到800米，进一步拉远视角
      ),
      orientation: {
        heading: Cesium.Math.toRadians(0), // 0度表示正北方向
        pitch: Cesium.Math.toRadians(-90), // -90度表示完全俯视
        roll: 0
      }
    })
    
    // 打印初始视角位置，便于后续调整
    setTimeout(() => {
      if (viewer.value) {
        const camera = viewer.value.camera;
        const position = camera.position;
        const orientation = camera.orientation;
        
        // 将相机位置转换为经纬度
        const cartographic = Cesium.Cartographic.fromCartesian(position);
        const longitude = Cesium.Math.toDegrees(cartographic.longitude);
        const latitude = Cesium.Math.toDegrees(cartographic.latitude);
        const height = cartographic.height;
        
        console.log('📸 初始视角位置：');
        console.log('经纬度：', { longitude, latitude, height });
        console.log('相机位置：', position);
        console.log('相机朝向：', {
          heading: Cesium.Math.toDegrees(camera.heading),
          pitch: Cesium.Math.toDegrees(camera.pitch),
          roll: Cesium.Math.toDegrees(camera.roll)
        });
        console.log('相机方向向量：', camera.direction);
        console.log('相机上方向量：', camera.up);
        console.log('相机右方向量：', camera.right);
      }
    }, 1000);
    
    // 添加楼栋标记
    addBuildingMarker(config)
    
    // 设置为当前激活的楼栋
    activeBuildingId.value = config.id
    
    return tileset
  } catch (error) {
    console.error(`❌ 加载 ${config.name} 3D Tiles 模型失败:`, error)
    return null
  }
}

// 通用添加楼栋标记函数
const addBuildingMarker = (config: BuildingConfig) => {
  if (!viewer.value) return
  
  const markerPosition = Cesium.Cartesian3.fromDegrees(
    config.marker.longitude,
    config.marker.latitude,
    config.marker.height
  )
  
  viewer.value.entities.add({
    id: `${config.id}_marker`,
    name: JSON.stringify({ cesiumType: 'cylinderBuilding', buildingId: config.id }),
    position: markerPosition,
    point: {
      pixelSize: 15,
      color: Cesium.Color.YELLOW,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 3,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 500) // 距离超过500米时隐藏
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
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 500) // 距离超过500米时隐藏
    }
  })
  
  // 添加楼栋信息标签，显示在模型上方
  const infoLabelPosition = Cesium.Cartesian3.fromDegrees(
    config.marker.longitude,
    config.marker.latitude,
    config.marker.height + 10
  )
  
  viewer.value.entities.add({
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
      show: false, // 初始状态为隐藏
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 500), // 距离超过500米时隐藏
      translucencyByDistance: new Cesium.NearFarScalar(0, 1.0, 1000, 0.5),
      pixelOffsetScaleByDistance: new Cesium.NearFarScalar(0, 1.0, 1000, 0.5)
    }
  })
  
  console.log(`📍 ${config.name} 标记已添加`)
}

// 楼栋单体化（兼容旧代码）
const tilesModel = () => {
  if (buildingConfigs.length === 0) {
    console.warn('⚠️ 没有配置楼栋数据')
    return
  }
  
  const config = buildingConfigs[0]
  if (!config) {
    console.warn('⚠️ 楼栋配置不存在')
    return
  }
  
  createBuildingHighlight(config)
}

// 楼栋柱体实体
const cylinderModel = () => {
  if (!viewer.value) return
  
  buildingConfigs.forEach(config => {
    viewer.value.entities.add({
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
        new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(140), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0))
      ),
      cylinder: {
        length: 80, // 圆柱体高度
        topRadius: 23, // 圆柱体顶部半径
        bottomRadius: 23, // 圆柱体底部半径
        material: Cesium.Color.fromCssColorString('rgba(255, 255, 255, 0.01)'), // 材质
        slices: 100, // 圆柱周围圆圈分段数
        numberOfVerticalLines: 100 // 圆柱垂直线分段数
      }
    })
  })
}

// 楼栋分层实体
const boxFloodModel = (data: 'first' | 'second' | 'third' | 'four') => {
  if (!viewer.value) return
  
  viewer.value.entities.add({
    id: cylinders[data].id,
    name: '{"cesiumType": "boxFlood"}',
    position: Cesium.Cartesian3.fromDegrees(113.06025929925363, 22.645596984482292, cylinders[data].cylinder1),
    orientation: Cesium.Transforms.headingPitchRollQuaternion(
      Cesium.Cartesian3.fromDegrees(113.06025929925363, 22.645596984482292, cylinders[data].cylinder1),
      new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(116), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0))
    ),
    box: {
      dimensions: new Cesium.Cartesian3(20.6, 47, 4),
      material: Cesium.Color.fromCssColorString('rgba(255, 255, 255, 0.01)') // 材质
    }
  })
}

// 获取模型边界球和中心点
const getModelInfo = async (tilesetUrl: string) => {
  if (!viewer.value) return null
  
  try {
    const tileset = await Cesium.Cesium3DTileset.fromUrl(tilesetUrl, {
      viewer: viewer.value
    })
    
    // 等待模型加载完成
    await tileset.readyPromise
    
    // 获取边界球
    const boundingSphere = tileset.boundingSphere
    
    // 将笛卡尔坐标转换为经纬度
    const cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center)
    const longitude = Cesium.Math.toDegrees(cartographic.longitude)
    const latitude = Cesium.Math.toDegrees(cartographic.latitude)
    const height = cartographic.height
    
    console.log('📍 模型坐标信息:', {
      经度: longitude,
      纬度: latitude,
      高度: height,
      边界球半径: boundingSphere.radius
    })
    
    // 返回世界坐标
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
    console.error('获取模型信息失败:', error)
    return null
  }
}

// 获取模型尺寸
const getModelDimensions = (radius: number) => {
  return {
    length: radius * 2,        // 长度约为直径
    width: radius * 2 * 0.7,  // 宽度约为直径的70%
    height: radius * 2.5        // 高度约为直径的2.5倍
  }
}

// 暴露到全局，方便在控制台调用
(window as any).getModelInfo = getModelInfo
(window as any).getModelDimensions = getModelDimensions

console.log('🔧 调试工具已加载，可在控制台使用:')
console.log('  - getModelInfo("/模型路径/tileset.json") 获取模型坐标')
console.log('  - getModelDimensions(radius) 根据半径获取尺寸')

onMounted(async () => {
  // 设置 Cesium Ion 访问令牌
  Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZWFlYjAyYS0xN2JlLTQ0OTItOGNkOC05YWJlNGY0MjI2NmQiLCJpZCI6NDkyMjYsImlhdCI6MTYxNzM0NjA3N30.crkTg0Logk_JUA7BROy0r9RqTJWCi8NZpTyu4qI11Fo'

  // 创建 Viewer 实例
  viewer.value = new Cesium.Viewer('cesiumContainer', {
    animation: false, // 关闭动画控制器
    baseLayerPicker: false, // 关闭基础地层选择器
    fullscreenButton: false, // 关闭全屏按钮
    vrButton: false, // 关闭VR按钮
    geocoder: false, // 关闭地址栏
    homeButton: false, // 关闭首页按钮
    infoBox: false, // 关闭信息框
    sceneModePicker: false, // 关闭场景模式选择器
    selectionIndicator: false, // 关闭选择指示器
    timeline: false, // 关闭时间轴
    navigationHelpButton: false, // 关闭导航帮助按钮
    skyBox: false, // 禁用星空
    skyAtmosphere: false, // 禁用大气层
    globe: false, // 禁用地球
    scene3DOnly: true,
    terrainProvider: new Cesium.EllipsoidTerrainProvider({})
  })

  // 隐藏 Cesium Ion 信用标识
  const creditContainer = viewer.value.container.querySelector('.cesium-viewer-bottom')
  if (creditContainer) {
    (creditContainer as HTMLElement).style.display = 'none'
  }

  // 隐藏加载指示器（圆圈）
  const loadingIndicator = viewer.value.container.querySelector('.cesium-viewer-loadingContainer')
  if (loadingIndicator) {
    (loadingIndicator as HTMLElement).style.display = 'none'
  }

  // 设置背景颜色（保持纯色背景）
  viewer.value.scene.backgroundColor = Cesium.Color.fromCssColorString('#000000')

  // 获取摄像头控制器
  cameraController.value = viewer.value.scene.screenSpaceCameraController

  // 禁用双击缩放功能，防止双击时黑屏
  viewer.value.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)

  // 启用自定义鼠标交互
  setupMouseInteractions()

  // 加载所有楼栋的 3D Tiles 模型
  for (const config of buildingConfigs) {
    await loadBuilding(config)
  }
  
  // 初始化模型
  cylinderModel()
  boxFloodModel('first')
  boxFloodModel('second')
  boxFloodModel('third')
  boxFloodModel('four')
  
  // 默认显示楼栋单体化效果
  setTimeout(() => {
    if (buildingConfigs.length > 0) {
      const config = buildingConfigs[0]
      if (config) {
        createBuildingHighlight(config)
      }
    }
  }, 2000) // 延迟2秒显示效果，确保模型加载完成
})

// 设置鼠标交互
const setupMouseInteractions = () => {
  if (!viewer.value) return

  const canvas = viewer.value.scene.canvas as HTMLCanvasElement

  // 鼠标滚轮事件（缩放）
  canvas.addEventListener('wheel', (event: WheelEvent) => {
    event.preventDefault()
    zoomModel(event.deltaY, event.clientX, event.clientY)
  }, { passive: false })

  // 右键菜单禁用
  canvas.addEventListener('contextmenu', (event: MouseEvent) => {
    event.preventDefault()
  })

  // 键盘事件
  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key.toUpperCase() === 'R') {
      resetView()
    }
  })

  // 得到当前三维场景
  const scene = viewer.value.scene
  
  // 定义当前场景的画布元素的事件处理
  const handler = new Cesium.ScreenSpaceEventHandler(scene.canvas)
  
  // 设置鼠标移动事件的处理函数，这里负责监听x,y坐标值变化
  handler.setInputAction(function () {
    if (mapMouseDown.value === true) {
      if (tilesModelObj && viewer.value) {
        try {
          viewer.value.scene.primitives.remove(tilesModelObj)
        } catch (error) {
          console.warn('移除单体化对象失败:', error)
        }
        tilesModelObj = null
      }
      
      // 隐藏所有楼栋信息标签
      buildingConfigs.forEach(bc => {
        const infoLabel = viewer.value?.entities.getById(`${bc.id}_info`)
        if (infoLabel) {
          (infoLabel as any).label.show = false
        }
      })
      
      if (tilesFloodTest && viewer.value) {
        try {
          viewer.value.scene.primitives.remove(tilesFloodTest)
        } catch (error) {
          console.warn('移除分层单体化对象失败:', error)
        }
        tilesFloodTest = null
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  
  // 鼠标按下
  handler.setInputAction(function () {
    mapMouseDown.value = true
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN)
  
  // 鼠标弹起
  handler.setInputAction(function () {
    mapMouseDown.value = false
  }, Cesium.ScreenSpaceEventType.LEFT_UP)

  // 鼠标点击事件
  handler.setInputAction((click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
    console.log('🖱️ 鼠标点击事件触发')
    console.log('屏幕坐标:', { x: click.position.x, y: click.position.y })
    
    // 检测点击的对象
    const pickedObject = viewer.value?.scene.pick(click.position)
    console.log('🎯 scene.pick() 结果:', pickedObject)
    
    if (Cesium.defined(pickedObject)) {
      console.log('✅ 点击到了物体')
      
      // 获取点击位置的3D坐标
      const pickPosition = viewer.value?.scene.pickPosition(click.position)
      if (Cesium.defined(pickPosition)) {
        // 将3D坐标转换为经纬度
        const cartographic = Cesium.Cartographic.fromCartesian(pickPosition)
        const longitude = Cesium.Math.toDegrees(cartographic.longitude)
        const latitude = Cesium.Math.toDegrees(cartographic.latitude)
        const height = cartographic.height
        
        console.log('🎯 点击位置坐标（用于配置新楼栋）:', {
          经度: longitude.toFixed(15),
          纬度: latitude.toFixed(15),
          高度: height.toFixed(2)
        })
      }
      
      // 检查点击的对象类型
      if (pickedObject.id) {
        console.log('📦 点击的是Entity，ID:', pickedObject.id.id)
        console.log('📦 Entity类型:', pickedObject.id.constructor.name)
        console.log('📦 Entity的name属性:', pickedObject.id.name)
      } else if (pickedObject.primitive) {
        console.log('📦 点击的是Primitive，类型:', pickedObject.primitive.constructor.name)
        console.log('📦 Primitive的name属性:', pickedObject.primitive.name)
      } else if (pickedObject.tile) {
        console.log('📦 点击的是3D Tile')
        console.log('📦 Tile内容:', pickedObject.tile.content)
      }
      
      // 检查是否有name属性
      console.log('=== 检查name属性 ===')
      
      // 检查Entity的name属性
      if (pickedObject.id && pickedObject.id.name) {
        console.log('Entity名称:', pickedObject.id.name)
        
        // 检测点击楼栋实体
        try {
          const modelDataObj = JSON.parse(pickedObject.id.name)
          if (modelDataObj.cesiumType === 'cylinderBuilding') {
            const buildingId = modelDataObj.buildingId || 'building1'
            console.log('🏢 点击的楼栋ID:', buildingId)
            
            // 查找对应的楼栋配置
            const buildingConfig = buildingConfigs.find(config => config.id === buildingId)
            if (buildingConfig) {
              console.log(`🏢 找到楼栋配置: ${buildingConfig.name}`)
              
              // 创建楼栋单体化
              createBuildingHighlight(buildingConfig)
            } else {
              console.warn(`⚠️ 未找到楼栋ID: ${buildingId} 的配置`)
            }
          } else if (modelDataObj.cesiumType === 'boxFlood') {
            // 检测点击到分层实体
            layeredTilesModel((pickedObject.id as any).id)
          }
        } catch (error) {
          console.error('解析模型数据失败:', error)
        }
      } else if (pickedObject.getPropertyNames && pickedObject.getProperty) {
        const propertyNames = pickedObject.getPropertyNames()
        console.log('所有属性名:', propertyNames)
        if (propertyNames.includes('name')) {
          const name = pickedObject.getProperty('name')
          console.log('模型名称:', name)
        } else {
          console.log('模型没有name属性')
        }
      } else if (pickedObject.name) {
        console.log('模型名称:', pickedObject.name)
        
        // 检测点击楼栋实体
        try {
          const modelDataObj = JSON.parse(pickedObject.name)
          if (modelDataObj.cesiumType === 'cylinderBuilding') {
            tilesModel()
          } else if (modelDataObj.cesiumType === 'boxFlood') {
            // 检测点击到分层实体
            layeredTilesModel((pickedObject as any).id.id)
          }
        } catch (error) {
          console.error('解析模型数据失败:', error)
        }
      } else if (pickedObject.primitive && pickedObject.primitive.name) {
        console.log('模型名称:', pickedObject.primitive.name)
      } else if (pickedObject.tile && pickedObject.tile.content && pickedObject.tile.content.name) {
        console.log('模型名称:', pickedObject.tile.content.name)
      } else {
        console.log('模型没有name属性')
        
        // 只移除单体化对象，不移除3D Tiles模型
        if (tilesModelObj && viewer.value) {
          try {
            console.log('🗑️ 移除楼栋单体化对象')
            viewer.value.scene.primitives.remove(tilesModelObj)
          } catch (error) {
            console.warn('移除单体化对象失败:', error)
          }
          tilesModelObj = null
        }
        
        // 隐藏所有楼栋信息标签
        buildingConfigs.forEach(bc => {
          const infoLabel = viewer.value?.entities.getById(`${bc.id}_info`)
          if (infoLabel) {
            (infoLabel as any).label.show = false
          }
        })
        
        if (tilesFloodTest && viewer.value) {
          try {
            console.log('🗑️ 移除分层单体化对象')
            viewer.value.scene.primitives.remove(tilesFloodTest)
          } catch (error) {
            console.warn('移除分层单体化对象失败:', error)
          }
          tilesFloodTest = null
        }
        
        // 检查3D Tiles模型是否还在
        if (viewer.value) {
          const tileset = (viewer.value as any).tileset
          if (tileset) {
            console.log('✅ 3D Tiles模型仍然存在')
            console.log('3D Tiles是否显示:', tileset.show)
          } else {
            console.log('❌ 3D Tiles模型不存在')
          }
        }
      }
    } else {
      console.log('🖱️ 点击了空白区域')
      
      // 只移除单体化对象，不移除3D Tiles模型
      if (tilesModelObj && viewer.value) {
        try {
          console.log('🗑️ 移除楼栋单体化对象')
          viewer.value.scene.primitives.remove(tilesModelObj)
        } catch (error) {
          console.warn('移除单体化对象失败:', error)
        }
        tilesModelObj = null
      }
      
      // 隐藏所有楼栋信息标签
      buildingConfigs.forEach(bc => {
        const infoLabel = viewer.value?.entities.getById(`${bc.id}_info`)
        if (infoLabel) {
          (infoLabel as any).label.show = false
        }
      })
      
      if (tilesFloodTest && viewer.value) {
        try {
          console.log('🗑️ 移除分层单体化对象')
          viewer.value.scene.primitives.remove(tilesFloodTest)
        } catch (error) {
          console.warn('移除分层单体化对象失败:', error)
        }
        tilesFloodTest = null
      }
      
      // 检查3D Tiles模型是否还在
      if (viewer.value) {
        const tileset = (viewer.value as any).tileset
        if (tileset) {
          console.log('✅ 3D Tiles模型仍然存在')
          console.log('3D Tiles是否显示:', tileset.show)
        } else {
          console.log('❌ 3D Tiles模型不存在')
        }
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
}

// 缩放模型
const zoomModel = (wheelDelta: number, clientX: number, clientY: number) => {
  if (!viewer.value) return

  const viewerInstance = viewer.value
  const camera = viewerInstance.camera
  const zoomSpeed = 0.1

  let zoomTarget: Cesium.Cartesian3
  
  // 获取鼠标位置对应的3D坐标（使用 pickPosition 获取准确的3D位置）
  const mousePosition = new Cesium.Cartesian2(clientX, clientY)
  const pickPosition = viewerInstance.scene.pickPosition(mousePosition)
  
  if (Cesium.defined(pickPosition)) {
    // 如果成功获取到鼠标位置的3D坐标，使用它作为缩放焦点
    zoomTarget = pickPosition
  } else {
    // 如果没有获取到，使用模型中心点作为备选
    const primitives = viewerInstance.scene.primitives
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
  
  // 计算相机到缩放目标的向量
  const targetToCamera = Cesium.Cartesian3.subtract(
    camera.position,
    zoomTarget,
    new Cesium.Cartesian3()
  )
  
  // 计算当前距离
  const distance = Cesium.Cartesian3.magnitude(targetToCamera)
  
  // 计算缩放后的新距离
  const zoomFactor = wheelDelta > 0 ? 1 + zoomSpeed : 1 - zoomSpeed
  const newDistance = distance * zoomFactor
  
  // 确保距离不会太小或太大
  const clampedDistance = Cesium.Math.clamp(newDistance, 10, 10000)
  
  // 计算新的相机位置
  const direction = Cesium.Cartesian3.normalize(targetToCamera, new Cesium.Cartesian3())
  const newPosition = Cesium.Cartesian3.add(
    zoomTarget,
    Cesium.Cartesian3.multiplyByScalar(direction, clampedDistance, new Cesium.Cartesian3()),
    new Cesium.Cartesian3()
  )
  
  // 更新相机位置
  camera.position = newPosition
}

// 重置视图
const resetView = async () => {
  if (!viewer.value) return

  try {
    const primitives = viewer.value.scene.primitives
    if (primitives.length > 0) {
      const tileset = primitives.get(0)
      await viewer.value.zoomTo(tileset, new Cesium.HeadingPitchRange(0, -90, 0))
    }
  } catch (error) {
    console.error('重置视图失败:', error)
  }
}
</script>

<style scoped>
.cesium-container {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
}

.cesium-viewer {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
