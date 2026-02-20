# Image Drag-and-Drop Tool

基于 Tauri + SolidJS + Material You 设计的图片处理工具。

![演示](public\preview.gif)

## 特点

- 支持拖入原始图片，拖出处理后图片
- 提供开箱即用的压缩预设，且支持自定义、持久化存储
- 支持压缩、等比例缩放、转换格式（JPG/PNG/WebP/AVIF）
- **Material You 动态主题** - 自动从图片提取主题色

## 技术栈

- **桌面框架**: Tauri v2
- **包管理**: Bun
- **前端框架**: TypeScript + SolidJS
- **组件库**: @material/web (Material You 官方组件)
- **图片处理**: browser-image-compression (WASM)

## 快速开始

### 安装依赖

```bash
bun install
```

### 启动开发环境

```bash
bun run tauri:dev
```

### 打包成单文件

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

## 预设配置

预设存储在系统配置目录下（`~/.config/img-dnd-tool/presets.json`），包含以下参数：

- `format`: 目标格式 (jpg/png/webp/avif)
- `width`: 目标宽度
- `height`: 目标高度
- `targetSize`: 目标文件大小（字节）

## License

MIT
