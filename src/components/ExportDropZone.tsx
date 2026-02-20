import { Show } from 'solid-js';
import { useImageStore, updateFileName } from '@/stores/imageStore';
import { useAppStore } from '@/stores/imageStore';
import { getCurrentPreset } from '@/stores/presetStore';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function ExportDropZone() {
  const imageState = useImageStore();
  const appState = useAppStore();

  const handleDragStart = (e: DragEvent) => {
    const processedBlob = imageState().processedBlob;
    if (!processedBlob) return;

    const preset = getCurrentPreset();
    const fileName = `${imageState().fileName}.${preset.format}`;
    
    // 创建 File 对象
    const file = new File([processedBlob], fileName, { 
      type: processedBlob.type 
    });

    // 设置拖拽数据
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('DownloadURL', 
        `${processedBlob.type}:${fileName}:${URL.createObjectURL(processedBlob)}`
      );
      // 添加文件到 dataTransfer
      try {
        e.dataTransfer.items.add(file);
      } catch (err) {
        console.log('添加文件到拖拽:', err);
      }
    }
  };

  const handleExport = async () => {
    const processedBlob = imageState().processedBlob;
    if (!processedBlob) return;

    try {
      const preset = getCurrentPreset();
      const suggestedName = `${imageState().fileName}.${preset.format}`;
      
      // 使用 Tauri 的 dialog 让用户选择保存位置
      const savePath = await save({
        filters: [{
          name: 'Image',
          extensions: [preset.format]
        }],
        defaultPath: suggestedName,
      });

      if (savePath) {
        // 将 Blob 转换为 Uint8Array
        const arrayBuffer = await processedBlob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // 写入文件
        await writeFile(savePath, uint8Array);
        
        console.log('文件已保存到:', savePath);
      }
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    }
  };

  return (
    <Show when={appState().hasProcessed}>
      <div class="export-section">
        <h3>导出</h3>
        
        <div class="filename-input">
          <label>文件名</label>
          <input
            type="text"
            value={imageState().fileName}
            onInput={(e) => updateFileName(e.target.value)}
            placeholder="输入文件名"
          />
          <span class="file-extension">.{getCurrentPreset().format}</span>
        </div>

        {/* 拖拽导出区域 */}
        <div 
          class="drag-export-zone"
          draggable={true}
          onDragStart={handleDragStart}
        >
          <div class="drag-icon">📤</div>
          <p class="drag-title">拖拽到任意位置</p>
          <p class="drag-subtitle">将图片拖到文件夹或桌面</p>
        </div>

        <div class="divider"><span>或</span></div>

        <button 
          class="export-button"
          onClick={handleExport}
        >
          <span class="export-icon">💾</span>
          <span>选择位置保存</span>
          <span class="export-hint">
            {formatFileSize(imageState().processedBlob?.size || 0)}
          </span>
        </button>

        <style>{
          `
          .export-section {
            background: var(--md-sys-color-surface-container-low);
            border-radius: 16px;
            padding: 20px;
            margin-top: 16px;
          }
          
          .export-section h3 {
            margin: 0 0 16px 0;
            font-size: 18px;
            color: var(--md-sys-color-on-surface);
          }
          
          .filename-input {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
          }
          
          .filename-input label {
            font-size: 14px;
            color: var(--md-sys-color-on-surface-variant);
            min-width: 60px;
          }
          
          .filename-input input {
            flex: 1;
            padding: 10px 14px;
            border: 1px solid var(--md-sys-color-outline);
            border-radius: 8px;
            font-size: 14px;
            background: var(--md-sys-color-surface);
            color: var(--md-sys-color-on-surface);
          }
          
          .file-extension {
            font-size: 14px;
            color: var(--md-sys-color-on-surface-variant);
            font-family: monospace;
          }
          
          .drag-export-zone {
            border: 2px dashed var(--md-sys-color-primary);
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            cursor: grab;
            transition: all 0.2s;
            background: var(--md-sys-color-primary-container);
            color: var(--md-sys-color-on-primary-container);
            margin-bottom: 12px;
          }
          
          .drag-export-zone:hover {
            background: var(--md-sys-color-primary-fixed);
            border-style: solid;
          }
          
          .drag-export-zone:active {
            cursor: grabbing;
          }
          
          .drag-icon {
            font-size: 32px;
            margin-bottom: 8px;
          }
          
          .drag-title {
            margin: 0 0 4px 0;
            font-weight: 600;
            font-size: 15px;
          }
          
          .drag-subtitle {
            margin: 0;
            font-size: 12px;
            opacity: 0.8;
          }
          
          .divider {
            display: flex;
            align-items: center;
            text-align: center;
            margin: 12px 0;
            color: var(--md-sys-color-on-surface-variant);
            font-size: 13px;
          }
          
          .divider::before,
          .divider::after {
            content: '';
            flex: 1;
            border-bottom: 1px solid var(--md-sys-color-outline-variant);
          }
          
          .divider span {
            padding: 0 12px;
          }
          
          .export-button {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px;
            background: var(--md-sys-color-surface);
            color: var(--md-sys-color-primary);
            border: 1px solid var(--md-sys-color-outline);
            border-radius: 12px;
            font-size: 15px;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .export-button:hover {
            background: var(--md-sys-color-primary-container);
            border-color: var(--md-sys-color-primary);
          }
          
          .export-icon {
            font-size: 18px;
          }
          
          .export-hint {
            margin-left: auto;
            font-size: 12px;
            color: var(--md-sys-color-on-surface-variant);
          }
          `
        }</style>
      </div>
    </Show>
  );
}
