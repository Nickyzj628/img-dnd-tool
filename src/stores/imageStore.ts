import { createSignal, createEffect } from 'solid-js';
import { ImageState, AppState } from '@/types';

// 图片状态
const [imageState, setImageState] = createSignal<ImageState>({
  originalFile: null,
  originalDataUrl: null,
  processedBlob: null,
  processedDataUrl: null,
  fileName: '',
});

// 应用状态
const [appState, setAppState] = createSignal<AppState>({
  isProcessing: false,
  error: null,
  hasProcessed: false,
  currentStep: 0,
});

// 处理图片 - 支持可选参数
export const processImage = async (
  file: File,
  width: number | null,
  height: number | null,
  format: string,
  targetSize: number | null
): Promise<Blob> => {
  const imageCompression = await import('browser-image-compression');
  
  // 构建选项
  const options: any = {
    fileType: `image/${format}`,
    initialQuality: 0.92,
    alwaysKeepResolution: false,
    preserveExif: false,
  };

  // 如果指定了尺寸，添加 maxWidthOrHeight
  if (width || height) {
    // 如果有原图尺寸，获取它
    const img = new Image();
    const imgLoaded = new Promise<{ width: number; height: number }>((resolve) => {
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.src = URL.createObjectURL(file);
    });
    const originalSize = await imgLoaded;
    URL.revokeObjectURL(img.src);
    
    // 使用指定的尺寸或原尺寸
    const targetWidth = width || originalSize.width;
    const targetHeight = height || originalSize.height;
    options.maxWidthOrHeight = Math.max(targetWidth, targetHeight);
  }

  let compressedFile = await imageCompression.default(file, options);
  
  // 如果指定了目标大小且超过目标，调整质量
  if (targetSize && compressedFile.size > targetSize && file.size > targetSize) {
    const quality = Math.min(0.92, targetSize / compressedFile.size);
    compressedFile = await imageCompression.default(file, {
      ...options,
      initialQuality: quality,
    });
  }
  
  return compressedFile;
};

// 读取文件为 Data URL
export const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// 加载原图
export const loadOriginalImage = async (file: File) => {
  const dataUrl = await readFileAsDataUrl(file);
  setImageState({
    originalFile: file,
    originalDataUrl: dataUrl,
    processedBlob: null,
    processedDataUrl: null,
    fileName: file.name.replace(/\.[^/.]+$/, ''),
  });
  setAppState(prev => ({ 
    ...prev, 
    hasProcessed: false, 
    error: null, 
    currentStep: 1 // 进入调整预设步骤
  }));
};

// 执行处理
export const executeProcess = async (
  width: number | null,
  height: number | null,
  format: string,
  targetSize: number | null
) => {
  const state = imageState();
  if (!state.originalFile) return;

  setAppState(prev => ({ ...prev, isProcessing: true, error: null }));

  try {
    const processedBlob = await processImage(
      state.originalFile,
      width,
      height,
      format,
      targetSize
    );
    
    const processedDataUrl = await readFileAsDataUrl(
      new File([processedBlob], 'processed', { type: processedBlob.type })
    );

    setImageState(prev => ({
      ...prev,
      processedBlob,
      processedDataUrl,
    }));
    setAppState(prev => ({ 
      ...prev, 
      hasProcessed: true,
      currentStep: 2 // 进入预览和导出步骤
    }));
  } catch (error) {
    setAppState(prev => ({ 
      ...prev, 
      error: error instanceof Error ? error : new Error('处理失败') 
    }));
  } finally {
    setAppState(prev => ({ ...prev, isProcessing: false }));
  }
};

// 更新文件名
export const updateFileName = (name: string) => {
  setImageState(prev => ({ ...prev, fileName: name }));
};

// 清除错误
export const clearError = () => {
  setAppState(prev => ({ ...prev, error: null }));
};

// 设置当前步骤
export const setStep = (step: number) => {
  setAppState(prev => ({ ...prev, currentStep: step }));
};

// 导出状态
export const useImageStore = () => imageState;
export const useAppStore = () => appState;
export const getImageState = () => imageState();
export const getAppState = () => appState();
