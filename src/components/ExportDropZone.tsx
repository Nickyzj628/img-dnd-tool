import { Show, createMemo } from 'solid-js';
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
  
  // 获取有效的文件格式（预设格式或原图格式）
  const getEffectiveFormat = createMemo(() => {
    const preset = getCurrentPreset();
    if (preset.format) {
      return preset.format;
    }
    // 从原图 MIME 类型中提取格式
    const originalType = imageState().originalFile?.type || '';
    const format = originalType.replace('image/', '');
    return format || 'webp';
  });
  
  // 直接从store获取尺寸
  const getDimensions = () => {
    const state = imageState();
    return {
      original: state.originalWidth && state.originalHeight 
        ? { width: state.originalWidth, height: state.originalHeight }
        : null,
      processed: state.processedWidth && state.processedHeight
        ? { width: state.processedWidth, height: state.processedHeight }
        : null
    };
  };

  const handleDragStart = (e: DragEvent) => {
    const processedBlob = imageState().processedBlob;
    if (!processedBlob) return;

    const fileName = `${imageState().fileName}.${getEffectiveFormat()}`;
    
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
      const effectiveFormat = getEffectiveFormat();
      const suggestedName = `${imageState().fileName}.${effectiveFormat}`;
      
      const savePath = await save({
        filters: [{
          name: 'Image',
          extensions: [effectiveFormat]
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

  const dims = getDimensions();

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
          <span class="file-extension">.{getEffectiveFormat()}</span>
        </div>

        <div class="image-info-table">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>宽高</th>
                <th>格式</th>
                <th>大小</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="row-label">原图</td>
                <td>{dims.original ? `${dims.original.width}×${dims.original.height}` : '-'}</td>
                <td>{imageState().originalFile?.type.replace('image/', '').toUpperCase() || '-'}</td>
                <td>{formatFileSize(imageState().originalFile?.size || 0)}</td>
              </tr>
              <tr>
                <td class="row-label">结果</td>
                <td>{dims.processed ? `${dims.processed.width}×${dims.processed.height}` : '-'}</td>
                <td>{getEffectiveFormat().toUpperCase()}</td>
                <td>{formatFileSize(imageState().processedBlob?.size || 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>

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
              <span class="drag-text">拖动到任意位置保存</span>
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

          .image-info-table {
            margin: 16px 0;
            background: var(--md-sys-color-surface);
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid var(--md-sys-color-outline-variant);
          }
          
          .image-info-table table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }
          
          .image-info-table th {
            background: var(--md-sys-color-surface-container);
            color: var(--md-sys-color-on-surface-variant);
            padding: 10px 8px;
            text-align: center;
            font-weight: 500;
            border-bottom: 1px solid var(--md-sys-color-outline-variant);
          }
          
          .image-info-table th:first-child {
            width: 60px;
          }
          
          .image-info-table td {
            padding: 10px 8px;
            text-align: center;
            color: var(--md-sys-color-on-surface);
            border-bottom: 1px solid var(--md-sys-color-outline-variant);
          }
          
          .image-info-table tr:last-child td {
            border-bottom: none;
          }
          
          .image-info-table .row-label {
            font-weight: 500;
            color: var(--md-sys-color-on-surface-variant);
            background: var(--md-sys-color-surface-container);
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
