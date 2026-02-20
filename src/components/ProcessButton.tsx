import { Show } from 'solid-js';
import { getCurrentPreset } from '@/stores/presetStore';
import { executeProcess, useImageStore, useAppStore } from '@/stores/imageStore';

export default function ProcessButton() {
  const appState = useAppStore();
  const imageState = useImageStore();

  const handleProcess = async () => {
    const state = imageState();
    if (!state.originalFile) {
      alert('请先选择图片');
      return;
    }

    const preset = getCurrentPreset();
    await executeProcess(
      preset.width,
      preset.height,
      preset.format,
      preset.targetSize
    );
  };

  const isDisabled = () => {
    return !imageState().originalFile || appState().isProcessing;
  };

  return (
    <div class="process-section">
      <button
        class="process-button"
        onClick={handleProcess}
        disabled={isDisabled()}
      >
        <Show when={appState().isProcessing}>
          <span class="spinner">◌</span>
          处理中...
        </Show>
        <Show when={!appState().isProcessing}>
          开始处理
        </Show>
      </button>

      <style>{
        `
        .process-section {
          display: flex;
          justify-content: center;
          padding: 24px;
        }
        
        .process-button {
          font-size: 18px;
          padding: 16px 32px;
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          border: none;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 160px;
        }
        
        .process-button:hover:not(:disabled) {
          background: var(--md-sys-color-primary-container);
          color: var(--md-sys-color-on-primary-container);
        }
        
        .process-button:disabled {
          opacity: 0.38;
          cursor: not-allowed;
        }
        
        .spinner {
          display: inline-block;
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        `
      }</style>
    </div>
  );
}
