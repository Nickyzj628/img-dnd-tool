# AGENTS.md

## 项目概述

这是一个基于 SolidJS + Tauri v2 的桌面应用程序，用于图片压缩和格式转换。

## 通用规则

- 除了代码，其他时候都使用简体中文
- 使用 Git 进行版本控制，不要提交大型二进制文件

---

## 构建与运行命令

### 前端开发

```bash
# 启动开发服务器
bun run dev

# 构建生产版本
bun run build

# 预览构建结果
bun run preview
```

### Tauri 桌面应用

```bash
# 启动 Tauri 开发模式（同时启动前端 + 桌面应用）
bun run tauri:dev

# 构建 Tauri 桌面应用
bun run tauri:build

# 仅运行 Tauri CLI
bun run tauri <command>
```

### 测试

本项目目前没有配置测试框架。如需添加测试，推荐使用：
- Vitest（与 Vite 集成良好）
- @testing-library/solid（SolidJS 组件测试）

运行单个测试的命令示例（配置 Vitest 后）：
```bash
bunx vitest run --testNamePattern "某个测试"
bunx vitest run src/stores/presetStore.test.ts
```

---

## 代码风格指南

### 语言与框架

- **前端框架**: SolidJS
- **桌面框架**: Tauri v2
- **语言**: TypeScript（严格模式）
- **包管理器**: bun

### 导入规范

- 使用 `@/` 作为 src 目录的别名
- 导入顺序：外部库 → 类型 → 组件 → store/工具
- 使用绝对导入，避免相对路径深层嵌套

```typescript
// 正确
import { createSignal } from 'solid-js';
import type { Preset } from '@/types';
import DropZone from '@/components/DropZone';
import { loadPresets } from '@/stores/presetStore';

// 避免
import { loadPresets } from '../stores/presetStore';
```

### 命名约定

- **组件文件**: PascalCase（如 `DropZone.tsx`、`PresetEditor.tsx`）
- **工具/Store 文件**: camelCase（如 `presetStore.ts`、`themeStore.ts`）
- **TypeScript 类型**: PascalCase（如 `Preset`、`ImageState`）
- **接口/类型前缀**: 使用有意义的名称，避免单一字母（除泛型外）
- **常量**: UPPER_SNAKE_CASE（如 `PRESETS_FILE`）
- **信号（Signal）**: 以 `is`、`has`、`should` 开头表示布尔值

### TypeScript 规范

- 启用严格模式 (`strict: true`)
- 优先使用类型注解，避免 `any`
- 使用 `interface` 定义对象类型，使用 `type` 定义联合类型/别名
- 使用 `| null` 而非 `?` 表示可选值（根据场景选择）

```typescript
// 推荐
interface Preset {
  id: string;
  name: string;
  format: 'webp' | 'jpeg' | 'png';
  width: number | null;
}

// 避免
interface Preset {
  id?: string; // 仅在真正可选时使用 ?
}
```

### 组件规范

- 使用函数式组件，默认导出
- 使用 SolidJS 的 `createSignal` 管理局部状态
- 使用 `createEffect` 处理副作用
- 在 `onMount` 中注册事件监听，`onCleanup` 中清理
- 组件文件使用 `.tsx` 扩展名

```typescript
export default function DropZone() {
  const [isDragging, setIsDragging] = createSignal(false);
  let fileInputRef: HTMLInputElement | undefined;

  onMount(async () => {
    // 注册事件
  });

  onCleanup(() => {
    // 清理事件
  });

  return (
    <div>
      <input ref={fileInputRef} />
    </div>
  );
}
```

### 错误处理

- 使用 `try/catch` 捕获异步操作中的错误
- 给用户提供友好的错误提示（中文）
- 记录错误到控制台以便调试
- 使用 `throw new Error` 封装业务逻辑错误

```typescript
try {
  await loadPresets();
} catch (error) {
  console.error('加载预设失败:', error);
  alert('加载预设失败，请重试');
}
```

### 状态管理

- 使用 SolidJS Store 或模块级 `createSignal` 管理全局状态
- Store 文件放在 `src/stores/` 目录
- 使用自定义 Hook 暴露状态（如 `usePresets()`）

```typescript
// src/stores/presetStore.ts
const [presets, setPresets] = createSignal<Preset[]>([]);

export const usePresets = () => presets;
```

### 样式规范

- 组件内使用 `<style>{`...</code>}` 嵌入样式（简单组件）
- 使用 Material Design CSS 变量（`--md-sys-color-*`）
- 遵循响应式设计，支持移动端

### Tauri 集成

- 使用 `@tauri-apps/api` 与后端通信
- 使用 `invoke` 调用 Rust 命令
- 使用 `listen` 监听 Tauri 事件
- 插件使用 `@tauri-apps/plugin-*` 包

```typescript
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

// 调用 Rust 命令
const result = await invoke('process_image', { path: '/path/to/image' });

// 监听事件
await listen('tauri://drag-drop', (event) => {
  // 处理拖拽事件
});
```

### 目录结构

```
src/
├── components/     # UI 组件
├── stores/         # 状态管理
├── types/          # TypeScript 类型定义
├── App.tsx         # 根组件
└── index.tsx       # 入口文件

src-tauri/
├── src/
│   └── main.rs     # Rust 后端入口
├── Cargo.toml
└── tauri.conf.json # Tauri 配置
```

---

## 常用操作

### 添加新组件

1. 在 `src/components/` 创建 `ComponentName.tsx`
2. 使用 `export default function ComponentName()`
3. 在父组件中导入使用

### 添加新状态

1. 在 `src/stores/` 创建 `xxxStore.ts`
2. 使用 `createSignal` 或 `createStore` 定义状态
3. 导出状态访问函数（如 `useXxx`）

### 添加 Tauri 命令

1. 在 `src-tauri/src/main.rs` 使用 `#[tauri::command]` 标记函数
2. 前端使用 `invoke` 调用

---

## 注意事项

- 开发 Tauri 应用时，使用 `bun run tauri:dev` 而非 `bun run dev`
- 修改 Rust 代码后需要重新编译 Tauri
- 桌面应用调试可使用 `console.log`（在 DevTools 中查看）
