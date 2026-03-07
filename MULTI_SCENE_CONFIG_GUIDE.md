# 多场景/多模型配置指南

## 🎯 核心概念

配置文件与 3D Tiles 模型是**一对多**的关系：
- **一个配置文件** = **一个场景**
- **一个场景** 可以包含 **多个 3D Tiles 模型**
- 每个 3D Tiles 模型对应 **一个楼栋配置**

---

## 📊 配置结构

### 方式 1: 单个配置文件，多个楼栋（当前方式）

**文件**: `public/config/scene.json`

```json
{
  "id": "baoli_project",
  "name": "保利项目",
  "buildings": [
    {
      "id": "building1",
      "name": "A6栋",
      "tilesetUrl": "/保利b3dm/tileset.json",  // ⭐ 3D Tiles 模型 1
      "monomerization": { /* A6栋的单体化配置 */ }
    },
    {
      "id": "building2",
      "name": "B1栋",
      "tilesetUrl": "/保利b3dm/tileset.json",  // ⭐ 3D Tiles 模型 2（同一个模型）
      "monomerization": { /* B1栋的单体化配置 */ }
    }
  ]
}
```

**说明**：
- 当前配置中，A6 和 B1 使用**同一个 3D Tiles 模型**
- 但它们有**不同的单体化配置**（不同的中心点、尺寸、偏移等）
- 这是因为一个 3D Tiles 模型可以包含多个楼栋

---

### 方式 2: 单个配置文件，多个不同的 3D Tiles 模型

如果你有多个不同的 3D Tiles 模型：

**文件**: `public/config/scene.json`

```json
{
  "id": "multi_model_scene",
  "name": "多模型场景",
  "buildings": [
    {
      "id": "building1",
      "name": "A6栋",
      "tilesetUrl": "/models/building_a/tileset.json",  // ⭐ 模型 A
      "monomerization": {
        "manual": {
          "center": { "x": -2306928.47, "y": 5418717.87, "z": 2440505.74 },
          "dimensions": { "length": 65, "width": 50, "height": 160 },
          "rotation": { "heading": 0.4, "pitch": 0, "roll": 0 },
          "offset": { "x": -14, "y": 17, "z": 93.5 }
        },
        "style": { "color": "#F26419", "alpha": 0.6 }
      },
      "marker": {
        "longitude": 113.06090721905448,
        "latitude": 22.645399902809583,
        "height": 85
      },
      "info": {
        "powerConsumption": "25410kw-h",
        "waterConsumption": "1149m³",
        "population": "56人"
      }
    },
    {
      "id": "building2",
      "name": "B1栋",
      "tilesetUrl": "/models/building_b/tileset.json",  // ⭐ 模型 B（不同的模型）
      "monomerization": {
        "manual": {
          "center": { "x": -2306930.0, "y": 5418720.0, "z": 2440500.0 },
          "dimensions": { "length": 55, "width": 50, "height": 160 },
          "rotation": { "heading": 0.4, "pitch": 0, "roll": 0 },
          "offset": { "x": -83, "y": 50, "z": 90 }
        },
        "style": { "color": "#FF6B6B", "alpha": 0.6 }
      },
      "marker": {
        "longitude": 113.060277174873093,
        "latitude": 22.645483701548006,
        "height": 100
      },
      "info": {
        "powerConsumption": "18500kw-h",
        "waterConsumption": "950m³",
        "population": "42人"
      }
    },
    {
      "id": "building3",
      "name": "C1栋",
      "tilesetUrl": "/models/building_c/tileset.json",  // ⭐ 模型 C（又一个不同的模型）
      "monomerization": {
        "autoDetect": true  // 使用自动检测
      },
      "marker": {
        "longitude": 113.061,
        "latitude": 22.646,
        "height": 90
      },
      "info": {
        "powerConsumption": "20000kw-h",
        "waterConsumption": "1000m³",
        "population": "48人"
      }
    }
  ]
}
```

**说明**：
- 每个 building 可以有**不同的 tilesetUrl**
- 每个 building 有**独立的单体化配置**
- 可以混合使用手动配置和自动检测

---

### 方式 3: 多个配置文件，多个场景

如果你有多个完全不同的项目/场景：

#### 场景 A 配置
**文件**: `public/config/project_a.json`

```json
{
  "id": "project_a",
  "name": "项目 A",
  "description": "第一个项目",
  "buildings": [
    {
      "id": "a_building1",
      "name": "A项目-1号楼",
      "tilesetUrl": "/models/project_a/building1/tileset.json",
      "monomerization": { /* 配置 */ },
      "marker": { /* 位置 */ },
      "info": { /* 信息 */ }
    },
    {
      "id": "a_building2",
      "name": "A项目-2号楼",
      "tilesetUrl": "/models/project_a/building2/tileset.json",
      "monomerization": { /* 配置 */ },
      "marker": { /* 位置 */ },
      "info": { /* 信息 */ }
    }
  ],
  "camera": {
    "longitude": 113.06,
    "latitude": 22.64,
    "height": 1000,
    "heading": 0,
    "pitch": -90,
    "roll": 0
  }
}
```

#### 场景 B 配置
**文件**: `public/config/project_b.json`

```json
{
  "id": "project_b",
  "name": "项目 B",
  "description": "第二个项目",
  "buildings": [
    {
      "id": "b_building1",
      "name": "B项目-1号楼",
      "tilesetUrl": "/models/project_b/building1/tileset.json",
      "monomerization": { /* 配置 */ },
      "marker": { /* 位置 */ },
      "info": { /* 信息 */ }
    },
    {
      "id": "b_building2",
      "name": "B项目-2号楼",
      "tilesetUrl": "/models/project_b/building2/tileset.json",
      "monomerization": { /* 配置 */ },
      "marker": { /* 位置 */ },
      "info": { /* 信息 */ }
    }
  ],
  "camera": {
    "longitude": 114.06,
    "latitude": 23.64,
    "height": 1000,
    "heading": 0,
    "pitch": -90,
    "roll": 0
  }
}
```

#### 使用方式

```typescript
// 加载项目 A
await sdk.loadSceneFromFile('/config/project_a.json')

// 切换到项目 B
await sdk.loadSceneFromFile('/config/project_b.json')
```

---

## 🗂️ 推荐的目录结构

### 结构 1: 单项目多楼栋

```
public/
├── config/
│   └── scene.json              # 单个配置文件
├── models/
│   ├── building_a/
│   │   └── tileset.json        # 楼栋 A 的模型
│   ├── building_b/
│   │   └── tileset.json        # 楼栋 B 的模型
│   └── building_c/
│       └── tileset.json        # 楼栋 C 的模型
```

### 结构 2: 多项目

```
public/
├── config/
│   ├── project_a.json          # 项目 A 配置
│   ├── project_b.json          # 项目 B 配置
│   └── project_c.json          # 项目 C 配置
├── models/
│   ├── project_a/
│   │   ├── building1/
│   │   │   └── tileset.json
│   │   └── building2/
│   │       └── tileset.json
│   ├── project_b/
│   │   ├── building1/
│   │   │   └── tileset.json
│   │   └── building2/
│   │       └── tileset.json
│   └── project_c/
│       └── building1/
│           └── tileset.json
```

### 结构 3: 模块化配置（高级）

```
public/
├── config/
│   ├── scenes/
│   │   ├── project_a.json      # 场景配置
│   │   ├── project_b.json
│   │   └── project_c.json
│   └── buildings/
│       ├── building_a.json     # 单个楼栋配置
│       ├── building_b.json
│       └── building_c.json
├── models/
│   └── ...
```

---

## 📝 配置示例

### 示例 1: 同一个 3D Tiles 模型，多个楼栋

**场景**：一个大型 3D Tiles 模型包含整个小区，需要对不同楼栋进行单体化

```json
{
  "id": "residential_complex",
  "name": "住宅小区",
  "buildings": [
    {
      "id": "building1",
      "name": "1号楼",
      "tilesetUrl": "/models/complex/tileset.json",  // 同一个模型
      "monomerization": {
        "manual": {
          "center": { "x": -2306928.47, "y": 5418717.87, "z": 2440505.74 },
          "dimensions": { "length": 65, "width": 50, "height": 160 },
          "rotation": { "heading": 0.4, "pitch": 0, "roll": 0 },
          "offset": { "x": -14, "y": 17, "z": 93.5 }
        },
        "style": { "color": "#F26419", "alpha": 0.6 }
      },
      "marker": { "longitude": 113.06, "latitude": 22.64, "height": 85 }
    },
    {
      "id": "building2",
      "name": "2号楼",
      "tilesetUrl": "/models/complex/tileset.json",  // 同一个模型
      "monomerization": {
        "manual": {
          "center": { "x": -2306930.0, "y": 5418720.0, "z": 2440500.0 },
          "dimensions": { "length": 55, "width": 50, "height": 160 },
          "rotation": { "heading": 0.4, "pitch": 0, "roll": 0 },
          "offset": { "x": -83, "y": 50, "z": 90 }
        },
        "style": { "color": "#FF6B6B", "alpha": 0.6 }
      },
      "marker": { "longitude": 113.061, "latitude": 22.645, "height": 100 }
    }
  ]
}
```

---

### 示例 2: 不同的 3D Tiles 模型

**场景**：每个楼栋都是独立的 3D Tiles 模型

```json
{
  "id": "separate_buildings",
  "name": "独立楼栋",
  "buildings": [
    {
      "id": "office_building",
      "name": "办公楼",
      "tilesetUrl": "/models/office/tileset.json",  // 办公楼模型
      "monomerization": {
        "autoDetect": true,
        "style": { "color": "#3498db", "alpha": 0.6 }
      },
      "marker": { "longitude": 113.06, "latitude": 22.64, "height": 100 },
      "info": {
        "type": "办公楼",
        "floors": "20层",
        "area": "15000㎡"
      }
    },
    {
      "id": "residential_building",
      "name": "住宅楼",
      "tilesetUrl": "/models/residential/tileset.json",  // 住宅楼模型
      "monomerization": {
        "autoDetect": true,
        "style": { "color": "#e74c3c", "alpha": 0.6 }
      },
      "marker": { "longitude": 113.061, "latitude": 22.645, "height": 90 },
      "info": {
        "type": "住宅楼",
        "floors": "30层",
        "area": "25000㎡"
      }
    },
    {
      "id": "shopping_mall",
      "name": "商场",
      "tilesetUrl": "/models/mall/tileset.json",  // 商场模型
      "monomerization": {
        "autoDetect": true,
        "style": { "color": "#f39c12", "alpha": 0.6 }
      },
      "marker": { "longitude": 113.062, "latitude": 22.646, "height": 50 },
      "info": {
        "type": "商场",
        "floors": "5层",
        "area": "50000㎡"
      }
    }
  ]
}
```

---

### 示例 3: 混合配置（手动 + 自动）

```json
{
  "id": "mixed_config",
  "name": "混合配置",
  "buildings": [
    {
      "id": "building1",
      "name": "精确配置楼栋",
      "tilesetUrl": "/models/building1/tileset.json",
      "monomerization": {
        "manual": {  // 手动精确配置
          "center": { "x": -2306928.47, "y": 5418717.87, "z": 2440505.74 },
          "dimensions": { "length": 65, "width": 50, "height": 160 },
          "rotation": { "heading": 0.4, "pitch": 0, "roll": 0 },
          "offset": { "x": -14, "y": 17, "z": 93.5 }
        },
        "style": { "color": "#F26419", "alpha": 0.6 }
      },
      "marker": { "longitude": 113.06, "latitude": 22.64, "height": 85 }
    },
    {
      "id": "building2",
      "name": "自动检测楼栋",
      "tilesetUrl": "/models/building2/tileset.json",
      "monomerization": {
        "autoDetect": true,  // 自动检测
        "style": { "color": "#FF6B6B", "alpha": 0.6 }
      },
      "marker": { "longitude": 113.061, "latitude": 22.645, "height": 100 }
    }
  ]
}
```

---

## 🔄 动态切换场景

### 方法 1: 在组件中切换

```typescript
// 在 CesiumViewerSDK.vue 中
const switchToProjectA = async () => {
  await sdk.loadSceneFromFile('/config/project_a.json')
}

const switchToProjectB = async () => {
  await sdk.loadSceneFromFile('/config/project_b.json')
}
```

### 方法 2: 添加场景选择器

修改 `src/components/CesiumViewerSDK.vue`：

```vue
<template>
  <div class="cesium-container">
    <div id="cesiumContainer" class="cesium-viewer"></div>
    
    <!-- 场景选择器 -->
    <div class="scene-selector">
      <button @click="loadScene('project_a')">项目 A</button>
      <button @click="loadScene('project_b')">项目 B</button>
      <button @click="loadScene('project_c')">项目 C</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const loadScene = async (sceneId: string) => {
  await sdk.loadSceneFromFile(`/config/${sceneId}.json`)
}
</script>

<style scoped>
.scene-selector {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.scene-selector button {
  margin: 5px;
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.scene-selector button:hover {
  background: #2980b9;
}
</style>
```

---

## 🎯 最佳实践

### 1. 命名规范

```json
{
  "id": "project_name_scene_name",  // 使用下划线分隔
  "buildings": [
    {
      "id": "project_building1",    // 前缀 + 楼栋标识
      "name": "项目名-1号楼"         // 中文名称
    }
  ]
}
```

### 2. 文件组织

```
public/
├── config/
│   ├── production/              # 生产环境配置
│   │   ├── project_a.json
│   │   └── project_b.json
│   ├── development/             # 开发环境配置
│   │   ├── project_a.json
│   │   └── project_b.json
│   └── scene.json               # 默认配置
```

### 3. 配置复用

创建配置模板：

```json
// public/config/templates/building_template.json
{
  "id": "BUILDING_ID",
  "name": "BUILDING_NAME",
  "tilesetUrl": "TILESET_URL",
  "monomerization": {
    "autoDetect": true,
    "style": {
      "color": "#F26419",
      "alpha": 0.6
    }
  },
  "marker": {
    "longitude": 0,
    "latitude": 0,
    "height": 100
  },
  "info": {
    "powerConsumption": "0kw-h",
    "waterConsumption": "0m³",
    "population": "0人"
  }
}
```

---

## 📊 配置关系图

```
配置文件 (scene.json)
    ↓
场景 (Scene)
    ↓
    ├─ 楼栋 1 (Building)
    │   ├─ 3D Tiles 模型 A (tilesetUrl)
    │   ├─ 单体化配置 (monomerization)
    │   ├─ 标记位置 (marker)
    │   └─ 楼栋信息 (info)
    │
    ├─ 楼栋 2 (Building)
    │   ├─ 3D Tiles 模型 B (tilesetUrl)  ← 可以是不同的模型
    │   ├─ 单体化配置 (monomerization)
    │   ├─ 标记位置 (marker)
    │   └─ 楼栋信息 (info)
    │
    └─ 楼栋 3 (Building)
        ├─ 3D Tiles 模型 A (tilesetUrl)  ← 也可以复用同一个模型
        ├─ 单体化配置 (monomerization)
        ├─ 标记位置 (marker)
        └─ 楼栋信息 (info)
```

---

## 💡 总结

### 关键点：

1. **一个配置文件 = 一个场景**
2. **一个场景可以包含多个楼栋**
3. **每个楼栋可以有不同的 3D Tiles 模型**
4. **每个楼栋有独立的单体化配置**
5. **可以通过切换配置文件来切换场景**

### 灵活性：

- ✅ 同一个 3D Tiles 模型，多个单体化配置
- ✅ 不同的 3D Tiles 模型，各自的单体化配置
- ✅ 多个配置文件，多个场景
- ✅ 动态加载和切换

---

**更新时间**: 2026-03-02  
**版本**: v1.0
