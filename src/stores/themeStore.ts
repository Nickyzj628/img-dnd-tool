import { 
  argbFromHex, 
  themeFromSourceColor, 
  applyTheme
} from '@material/material-color-utilities';

// 从图片提取主色
export const extractDominantColor = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('无法创建 canvas'));
        return;
      }

      // 缩小图片以加速处理
      canvas.width = 100;
      canvas.height = 100;
      ctx.drawImage(img, 0, 0, 100, 100);
      
      const imageData = ctx.getImageData(0, 0, 100, 100);
      const data = imageData.data;
      
      // 简单的颜色平均算法
      let r = 0, g = 0, b = 0;
      const pixelCount = data.length / 4;
      
      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }
      
      r = Math.round(r / pixelCount);
      g = Math.round(g / pixelCount);
      b = Math.round(b / pixelCount);
      
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      
      URL.revokeObjectURL(url);
      resolve(hex);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片加载失败'));
    };
    
    img.src = url;
  });
};

// 应用主题
export const applyMaterialTheme = (hexColor: string, dark: boolean = false) => {
  try {
    const argb = argbFromHex(hexColor);
    const theme = themeFromSourceColor(argb);
    
    applyTheme(theme, { target: document.body, dark });
  } catch (error) {
    console.error('应用主题失败:', error);
  }
};

// 从图片应用主题
export const applyThemeFromImage = async (file: File) => {
  try {
    const color = await extractDominantColor(file);
    applyMaterialTheme(color, false);
  } catch (error) {
    console.error('提取主题色失败:', error);
    applyMaterialTheme('#0066cc', false);
  }
};
