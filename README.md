# 图片处理工具

基于 Tauri + SolidJS + Material You 设计的图片处理桌面应用。

## 功能特性

- 🎨 **Material You 动态主题** - 自动从图片提取主题色
- 🖼️ **图片拖入** - 支持拖拽或点击选择图片
- ⚙️ **预设管理** - 可自定义处理预设，持久化存储
- 👁️ **对比预览** - Squoosh 风格左右对比查看处理前后效果
- 🔄 **图片处理** - 压缩、缩放、格式转换（WebP/JPEG/PNG）
- 💾 **导出功能** - 点击下载或拖拽导出处理后的图片

## 技术栈

- **桌面框架**: Tauri v2
- **前端框架**: SolidJS + TypeScript
- **UI 组件**: @material/web (Material You 官方组件)
- **图片处理**: browser-image-compression (WASM)
- **包管理**: Bun

## 快速开始

### 安装依赖

```bash
bun install
```

### 开发模式

```bash
bun run tauri:dev
```

### 构建应用

```bash
bun run tauri:build
```

## 项目结构

```
img-dnd-tool/
├── src/                        # SolidJS 前端代码
│   ├── components/             # 组件
│   ├── stores/                 # 状态管理
│   ├── types/                  # TypeScript 类型
│   ├── App.tsx                 # 主应用
│   └── index.tsx               # 入口
├── src-tauri/                  # Tauri Rust 后端
│   ├── src/
│   ├── capabilities/           # 权限配置
│   ├── icons/                  # 应用图标
│   └── Cargo.toml
└── package.json
```

## 使用说明

1. **拖入图片** - 将图片拖入应用或使用选择文件按钮
2. **选择预设** - 从预设列表中选择或创建新的预设
3. **调整参数** - 预设包含格式、尺寸、目标大小等参数
4. **开始处理** - 点击"开始处理"按钮生成结果
5. **导出图片** - 点击下载或拖拽导出处理后的图片

## 预设配置

预设存储在系统配置目录下（`~/.config/img-dnd-tool/presets.json`），包含以下参数：

- `format`: 目标格式 (webp/jpeg/png)
- `width`: 目标宽度
- `height`: 目标高度
- `targetSize`: 目标文件大小（字节）

## License

MIT
