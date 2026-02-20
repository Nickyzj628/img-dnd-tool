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
        aria-label="开始处理"
      >
        <Show when={appState().isProcessing}>
          <span class="spinner">◌</span>
        </Show>
        <Show when={!appState().isProcessing}>
          ▶
        </Show>
      </button>

      <style>{`
        .process-section {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
        }
        
        .process-button {
          width: 48px;
          height: 48px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          font-size: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        
        .process-button:hover:not(:disabled) {
          background: var(--md-sys-color-primary-container);
          color: var(--md-sys-color-on-primary-container);
        }
        
        .process-button:focus-visible {
          outline: 2px solid var(--md-sys-color-primary);
          outline-offset: 2px;
        }
        
        .process-button:disabled {
          opacity: 0.38;
          cursor: not-allowed;
        }
        
        .spinner {
          display: inline-block;
          animation: spin 1s linear infinite;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .spinner {
            animation: none;
          }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
