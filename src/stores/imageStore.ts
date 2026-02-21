import { createSignal, createEffect } from 'solid-js';
import { ImageState, AppState } from '@/types';

// 图片状态
const [imageState, setImageState] = createSignal<ImageState>({
  originalFile: null,
  originalDataUrl: null,
  originalWidth: null,
  originalHeight: null,
  processedBlob: null,
  processedDataUrl: null,
  processedWidth: null,
  processedHeight: null,
  fileName: '',
});

// 应用状态
const [appState, setAppState] = createSignal<AppState>({
  isProcessing: false,
  error: null,
  hasProcessed: false,
  currentStep: 0,
});

// 计算目标尺寸，根据规则处理宽高
function calculateTargetDimensions(
  originalWidth: number,
  originalHeight: number,
  targetWidth: number | null,
  targetHeight: number | null
): { width: number; height: number } {
  const originalRatio = originalWidth / originalHeight;
  
  // 限制最大值不超过原图尺寸
  const maxWidth = originalWidth;
  const maxHeight = originalHeight;
  
  if (targetWidth !== null && targetHeight !== null) {
    // 同时填写宽高 → 压缩到对应宽高（限制不超过原图）
    return {
      width: Math.min(targetWidth, maxWidth),
      height: Math.min(targetHeight, maxHeight)
    };
  } else if (targetWidth !== null && targetHeight === null) {
    // 只填宽度 → 按原图比例计算高度
    const newWidth = Math.min(targetWidth, maxWidth);
    const newHeight = Math.round(newWidth / originalRatio);
    return { width: newWidth, height: Math.min(newHeight, maxHeight) };
  } else if (targetWidth === null && targetHeight !== null) {
    // 只填高度 → 按原图比例计算宽度
    const newHeight = Math.min(targetHeight, maxHeight);
    const newWidth = Math.round(newHeight * originalRatio);
    return { width: Math.min(newWidth, maxWidth), height: newHeight };
  } else {
    // 都未填写 → 保持原图尺寸
    return { width: originalWidth, height: originalHeight };
  }
}

// 处理图片 - 支持可选参数
export const processImage = async (
  file: File,
  width: number | null,
  height: number | null,
  format: string | null,
  targetSize: number | null
): Promise<Blob> => {
  // 确定目标格式，如果未指定则使用原图格式
  const targetFormat = format || file.type.replace('image/', '');
  
  const imageCompression = await import('browser-image-compression');
  
  // 获取原图尺寸
  const img = new Image();
  const originalDimensions = await new Promise<{ width: number; height: number }>((resolve) => {
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.src = URL.createObjectURL(file);
  });
  URL.revokeObjectURL(img.src);
  
  // 计算目标尺寸
  const targetDims = calculateTargetDimensions(
    originalDimensions.width,
    originalDimensions.height,
    width,
    height
  );
  
  // 构建选项
  const options: any = {
    fileType: `image/${targetFormat}`,
    initialQuality: 0.92,
    alwaysKeepResolution: false,
    preserveExif: false,
    // 使用精确的目标尺寸
    maxWidthOrHeight: Math.max(targetDims.width, targetDims.height),
  };

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
  
  // 获取原图尺寸
  const img = new Image();
  const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.src = dataUrl;
  });
  
  setImageState({
    originalFile: file,
    originalDataUrl: dataUrl,
    originalWidth: dimensions.width,
    originalHeight: dimensions.height,
    processedBlob: null,
    processedDataUrl: null,
    processedWidth: null,
    processedHeight: null,
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
  format: string | null,
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

    // 获取处理后图片的尺寸
    const processedImg = new Image();
    const processedDimensions = await new Promise<{ width: number; height: number }>((resolve) => {
      processedImg.onload = () => resolve({ width: processedImg.width, height: processedImg.height });
      processedImg.src = processedDataUrl;
    });

    setImageState(prev => ({
      ...prev,
      processedBlob,
      processedDataUrl,
      processedWidth: processedDimensions.width,
      processedHeight: processedDimensions.height,
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

// 返回上一步
export const goBack = () => {
  const step = appState().currentStep;
  
  if (step === 1) {
    // 从调整预设返回到导入 - 清除图片状态
    setImageState({
      originalFile: null,
      originalDataUrl: null,
      originalWidth: null,
      originalHeight: null,
      processedBlob: null,
      processedDataUrl: null,
      processedWidth: null,
      processedHeight: null,
      fileName: '',
    });
    setAppState(prev => ({
      ...prev,
      currentStep: 0,
      hasProcessed: false,
      error: null,
    }));
  } else if (step === 2) {
    // 从导出返回到调整预设 - 清除处理后的图片，重置文件名
    const originalFileName = imageState().originalFile?.name.replace(/\.[^/.]+$/, '') || '';
    setImageState(prev => ({
      ...prev,
      processedBlob: null,
      processedDataUrl: null,
      fileName: originalFileName,
    }));
    setAppState(prev => ({
      ...prev,
      currentStep: 1,
      hasProcessed: false,
      error: null,
    }));
  }
};

// 导出状态
export const useImageStore = () => imageState;
export const useAppStore = () => appState;
