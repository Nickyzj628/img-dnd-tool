import { createSignal, Show } from 'solid-js';
import { useImageStore } from '@/stores/imageStore';

interface PreviewCompareProps {
  enableSlider?: boolean;
  title?: string;
}

export default function PreviewCompare(props: PreviewCompareProps) {
  const imageState = useImageStore();
  const [sliderPosition, setSliderPosition] = createSignal(50);
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = createSignal(false);

  const handleMouseDown = (e: MouseEvent) => {
    if (!props.enableSlider) return;
    setIsDragging(true);
    updateSliderPosition(e);
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    // 禁止文本选择
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging()) return;
    updateSliderPosition(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    
    // 恢复文本选择
    document.body.style.userSelect = '';
  };

  const updateSliderPosition = (e: MouseEvent) => {
    const container = containerRef();
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(5, Math.min(95, percentage))); // 限制在 5%-95% 之间，避免遮挡标签
  };

  return (
    <Show when={imageState().originalDataUrl}>
      <div class="preview-container">
        <Show when={props.title}>
          <div class="preview-title">{props.title}</div>
        </Show>
        <div 
          ref={setContainerRef}
          class="compare-container"
          classList={{ 'has-slider': props.enableSlider }}
          onMouseDown={handleMouseDown}
        >
          {/* 原图（左侧 - 完整显示） */}
          <div class="image-wrapper original-full">
            <img 
              src={imageState().originalDataUrl!} 
              alt="原图"
              draggable={false}
              style={{ 'user-select': 'none' }}
            />
            <div class="image-label original-label-full">原图</div>
          </div>

          {/* 处理后图片（右侧 - 通过 clip 显示） */}
          <Show when={imageState().processedDataUrl}>
            <div 
              class="image-wrapper processed"
              style={{ 
                'clip-path': props.enableSlider ? `inset(0 ${sliderPosition()}% 0 0)` : 'none',
                'z-index': 2
              }}
            >
              <img 
                src={imageState().processedDataUrl!} 
                alt="处理后"
                draggable={false}
                style={{ 'user-select': 'none' }}
              />
              <div class="image-label processed-label">处理后</div>
            </div>
          </Show>

          {/* 滑动条 */}
          <Show when={props.enableSlider && imageState().processedDataUrl}>
            <div 
              class="slider"
              style={{ left: `${sliderPosition()}%` }}
            >
              <div class="slider-handle" aria-hidden="true">
                <span class="slider-icon">◀▶</span>
              </div>
            </div>
          </Show>
        </div>

        {/* 文件信息 */}
        <div class="file-info">
          <Show when={imageState().originalFile}>
            <div class="info-item">
              <span>原图: {formatFileSize(imageState().originalFile!.size)}</span>
            </div>
          </Show>
          <Show when={imageState().processedBlob}>
            <div class="info-item">
              <span>处理后: {formatFileSize(imageState().processedBlob!.size)}</span>
            </div>
          </Show>
        </div>
      </div>

      <style>{
        `
        .preview-container {
          background: var(--md-sys-color-surface-container);
          border-radius: 16px;
          padding: 16px;
          margin: 16px 0;
          user-select: none;
          -webkit-user-select: none;
        }
        
        .preview-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
          margin-bottom: 12px;
        }
        
        .compare-container {
          position: relative;
          width: 100%;
          height: 300px;
          overflow: hidden;
          border-radius: 12px;
          cursor: default;
          background: var(--md-sys-color-surface-dim);
          user-select: none;
          -webkit-user-select: none;
        }
        
        .compare-container.has-slider {
          cursor: col-resize;
        }
        
        .image-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
          -webkit-user-select: none;
        }
        
        .image-wrapper img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          pointer-events: none;
          user-select: none;
          -webkit-user-select: none;
        }
        
        .original-full {
          z-index: 1;
        }
        
        .processed {
          z-index: 2;
        }
        
        .image-label {
          position: absolute;
          bottom: 16px;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          user-select: none;
          pointer-events: none;
        }
        
        .original-label-full {
          left: 16px;
        }
        
        .processed-label {
          right: 16px;
        }
        
        .slider {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          background: white;
          transform: translateX(-50%);
          z-index: 3;
          box-shadow: 0 0 10px rgba(0,0,0,0.3);
          pointer-events: none;
          user-select: none;
        }
        
        .slider-handle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          pointer-events: none;
          user-select: none;
        }
        
        .slider-icon {
          font-size: 12px;
          color: #333;
          letter-spacing: -2px;
          user-select: none;
        }
        
        .file-info {
          display: flex;
          gap: 24px;
          margin-top: 12px;
          font-size: 14px;
          color: var(--md-sys-color-on-surface-variant);
          user-select: none;
        }
        
        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        `
      }</style>
    </Show>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
