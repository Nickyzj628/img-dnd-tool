import { createSignal, createEffect, Show } from 'solid-js';
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
  const [imageDimensions, setImageDimensions] = createSignal<{original: {width: number, height: number} | null, processed: {width: number, height: number} | null}>({original: null, processed: null});

  createEffect(() => {
    const originalDataUrl = imageState().originalDataUrl;
    const processedDataUrl = imageState().processedDataUrl;
    
    if (originalDataUrl) {
      const originalImg = new Image();
      originalImg.onload = () => {
        setImageDimensions(prev => ({...prev, original: {width: originalImg.width, height: originalImg.height}}));
      };
      originalImg.src = originalDataUrl;
    }
    
    if (processedDataUrl) {
      const processedImg = new Image();
      processedImg.onload = () => {
        setImageDimensions(prev => ({...prev, processed: {width: processedImg.width, height: processedImg.height}}));
      };
      processedImg.src = processedDataUrl;
    }
  });

  const handleDragStart = (e: DragEvent) => {
    const processedBlob = imageState().processedBlob;
    if (!processedBlob) return;

    const preset = getCurrentPreset();
    const fileName = `${imageState().fileName}.${preset.format}`;
    
    const file = new File([processedBlob], fileName, { 
      type: processedBlob.type 
    });

    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('DownloadURL', 
        `${processedBlob.type}:${fileName}:${URL.createObjectURL(processedBlob)}`
      );
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
      
      const savePath = await save({
        filters: [{
          name: 'Image',
          extensions: [preset.format]
        }],
        defaultPath: suggestedName,
      });

      if (savePath) {
        const arrayBuffer = await processedBlob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        await writeFile(savePath, uint8Array);
        
        console.log('文件已保存到:', savePath);
      }
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    }
  };

  const preset = getCurrentPreset();
  const dims = imageDimensions();

  return (
    <Show when={appState().hasProcessed}>
      <div class="export-section">
        <div class="filename-input">
          <label>文件名</label>
          <input
            type="text"
            value={imageState().fileName}
            onInput={(e) => updateFileName(e.target.value)}
            placeholder="输入文件名"
          />
          <span class="file-extension">.{preset.format}</span>
        </div>

        <Show when={dims.original || dims.processed}>
          <div class="image-info">
            <Show when={dims.original}>
              <span class="info-item">
                原图: {dims.original!.width}×{dims.original!.height} {formatFileSize(imageState().originalFile?.size || 0)}
              </span>
            </Show>
            <Show when={dims.processed}>
              <span class="info-item">
                → {dims.processed!.width}×{dims.processed!.height} {formatFileSize(imageState().processedBlob?.size || 0)}
              </span>
            </Show>
          </div>
        </Show>

        <div class="export-methods">
          <button 
            class="export-button"
            onClick={handleExport}
          >
            <span class="export-icon">💾</span>
            <span>选择位置保存</span>
          </button>

          <div 
            class="drag-export-zone"
            draggable={true}
            onDragStart={handleDragStart}
          >
            <div class="drag-export-content">
              <div class="drag-icon">📤</div>
              <span class="drag-text">拖动保存</span>
            </div>
          </div>
        </div>

        <style>{`
          .export-section {
            background: var(--md-sys-color-surface-container-low);
            border-radius: 16px;
            padding: 20px;
          }
          
          .filename-input {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
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

          .image-info {
            display: flex;
            gap: 12px;
            margin-bottom: 16px;
            font-size: 13px;
            color: var(--md-sys-color-on-surface-variant);
          }
          
          .export-methods {
            display: flex;
            gap: 12px;
          }
          
          .export-button {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 14px;
            background: var(--md-sys-color-surface);
            color: var(--md-sys-color-primary);
            border: 1px solid var(--md-sys-color-outline);
            border-radius: 12px;
            font-size: 14px;
            cursor: pointer;
            transition: background 0.2s, border-color 0.2s;
          }
          
          .export-button:hover {
            background: var(--md-sys-color-primary-container);
            border-color: var(--md-sys-color-primary);
          }

          .drag-export-zone {
            flex: 1;
            border: 2px dashed var(--md-sys-color-primary);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: grab;
            transition: background 0.2s, border-style 0.2s;
            background: var(--md-sys-color-primary-container);
            color: var(--md-sys-color-on-primary-container);
            padding: 14px;
          }
          
          .drag-export-zone:hover {
            background: var(--md-sys-color-primary-fixed);
            border-style: solid;
          }
          
          .drag-export-zone:active {
            cursor: grabbing;
          }
          
          .drag-export-content {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .drag-icon {
            font-size: 18px;
          }
          
          .drag-text {
            font-size: 13px;
          }
          
          .export-icon {
            font-size: 16px;
          }
          `
        }</style>
      </div>
    </Show>
  );
}
