// 预设配置
export interface Preset {
  id: string;
  name: string;
  format: 'webp' | 'jpeg' | 'png';
  width: number | null;      // null 表示保持原宽度
  height: number | null;     // null 表示保持原高度
  targetSize: number | null; // null 表示不限制大小，单位字节
  aspectRatio: string | null; // 比例：'16:9' | '4:3' | '21:9' | null
}

// 图片处理状态
export interface ImageState {
  originalFile: File | null;
  originalDataUrl: string | null;
  processedBlob: Blob | null;
  processedDataUrl: string | null;
  fileName: string;
}

// 应用状态
export interface AppState {
  isProcessing: boolean;
  error: Error | null;
  hasProcessed: boolean;
  currentStep: number; // 当前步骤：0=导入, 1=调整预设, 2=预览和导出
}

// 主题状态
export interface ThemeState {
  sourceColor: string | null;
  isDark: boolean;
}
