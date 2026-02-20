import { createSignal, onMount, onCleanup, Show } from 'solid-js';
import { loadOriginalImage, useAppStore } from '@/stores/imageStore';
import { applyThemeFromImage } from '@/stores/themeStore';
import { listen } from '@tauri-apps/api/event';
import { readFile } from '@tauri-apps/plugin-fs';

export default function DropZone() {
  const [isDragging, setIsDragging] = createSignal(false);
  let fileInputRef: HTMLInputElement | undefined;
  const appState = useAppStore();
  const currentStep = () => appState().currentStep;

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请拖入图片文件 (支持 jpg, png, webp 等格式)');
      return;
    }

    try {
      await applyThemeFromImage(file);
      await loadOriginalImage(file);
    } catch (error) {
      console.error('处理图片失败:', error);
      alert('图片处理失败，请重试');
    }
  };

  // 从文件路径创建 File 对象
  const loadFileFromPath = async (path: string) => {
    try {
      console.log('从路径加载文件:', path);
      
      // 读取文件内容
      const contents = await readFile(path);
      
      // 从路径获取文件名和扩展名
      const fileName = path.split(/[\\/]/).pop() || 'image';
      const ext = fileName.split('.').pop()?.toLowerCase() || '';
      
      // 确定 MIME 类型
      let mimeType = 'image/jpeg';
      if (ext === 'png') mimeType = 'image/png';
      else if (ext === 'webp') mimeType = 'image/webp';
      else if (ext === 'gif') mimeType = 'image/gif';
      
      // 创建 Blob 和 File
      const blob = new Blob([contents], { type: mimeType });
      const file = new File([blob], fileName, { type: mimeType });
      
      console.log('文件创建成功:', file.name, file.type, file.size);
      await processFile(file);
    } catch (error) {
      console.error('从路径加载文件失败:', error);
      alert('加载文件失败: ' + (error as Error).message);
    }
  };

  onMount(async () => {
    console.log('DropZone 挂载，注册 Tauri 事件监听');
    
    // 监听 Tauri 的拖拽事件 - 仅在导入阶段响应
    const unlistenDrop = await listen<{ paths: string[] }>('tauri://drag-drop', async (event) => {
      console.log('✅ Tauri 拖拽 drop 事件:', event);
      setIsDragging(false);
      
      // 仅在导入阶段处理拖拽
      if (currentStep() !== 0) {
        console.log('⛔ 非导入阶段，忽略拖拽');
        return;
      }
      
      if (event.payload?.paths?.length > 0) {
        const path = event.payload.paths[0];
        console.log('📁 拖入的文件路径:', path);
        await loadFileFromPath(path);
      }
    });

    // 监听拖拽进入事件 - 仅在导入阶段响应
    const unlistenEnter = await listen('tauri://drag-enter', (event) => {
      if (currentStep() !== 0) {
        console.log('⛔ 非导入阶段，忽略拖拽进入');
        return;
      }
      console.log('👆 Tauri 拖拽进入窗口:', event);
      setIsDragging(true);
    });

    // 监听拖拽离开事件
    const unlistenLeave = await listen('tauri://drag-leave', () => {
      setIsDragging(false);
    });

    // 监听拖拽在窗口上方移动 - 仅在导入阶段响应
    const unlistenOver = await listen('tauri://drag-over', () => {
      // 仅在导入阶段处理
    });

    // 清理函数
    onCleanup(() => {
      console.log('DropZone 卸载，清理事件监听');
      unlistenDrop();
      unlistenEnter();
      unlistenLeave();
      unlistenOver();
    });
  });

  // 保持原有的 HTML5 拖拽 API 作为后备
  const handleDragEnter = (e: DragEvent) => {
    if (currentStep() !== 0) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragOver = (e: DragEvent) => {
    if (currentStep() !== 0) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: DragEvent) => {
    if (currentStep() !== 0) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: DragEvent) => {
    if (currentStep() !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    
    // HTML5 拖拽作为后备
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      console.log('HTML5 拖入文件:', files[0].name);
      await processFile(files[0]);
    }
  };

  const handleFileSelect = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    await processFile(file);
    input.value = '';
  };

  const handleClick = () => {
    fileInputRef?.click();
  };

  return (
    <div
      class="drop-zone"
      classList={{ dragging: isDragging() }}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      <div class="drop-content">
        <img src="../src-tauri/icons/128x128.png" alt="" class="drop-icon-img" />
        <p class="drop-title">拖入图片到此处</p>
        <p class="drop-subtitle">或点击选择文件</p>
        <button 
          class="select-button"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          选择文件
        </button>
      </div>

      <style>{
        `
        .drop-zone {
          border: 3px dashed var(--md-sys-color-outline);
          border-radius: 16px;
          padding: 60px 32px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.2s ease, background 0.2s ease;
          background: var(--md-sys-color-surface-container-low);
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .drop-zone:hover {
          border-color: var(--md-sys-color-primary);
          background: var(--md-sys-color-surface-container);
        }
        
        .drop-zone.dragging {
          border-color: var(--md-sys-color-primary);
          background: var(--md-sys-color-primary-container);
          border-style: solid;
          border-width: 3px;
        }
        
        .drop-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: var(--md-sys-color-on-surface-variant);
          pointer-events: none;
        }
        
        .drop-icon {
          font-size: 56px;
          line-height: 1;
          margin-bottom: 8px;
        }
        
        .drop-icon-img {
          width: 64px;
          height: 64px;
          margin-bottom: 8px;
          object-fit: contain;
        }
        
        .drop-title {
          margin: 0;
          font-size: 20px;
          font-weight: 500;
          color: var(--md-sys-color-on-surface);
        }
        
        .drop-subtitle {
          margin: 0;
          font-size: 14px;
          opacity: 0.7;
        }
        
        .select-button {
          margin-top: 16px;
          padding: 12px 24px;
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          border: none;
          border-radius: 24px;
          font-size: 15px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          pointer-events: auto;
          font-weight: 500;
        }
        
        .select-button:hover {
          background: var(--md-sys-color-primary-container);
          color: var(--md-sys-color-on-primary-container);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        `
      }</style>
    </div>
  );
}
