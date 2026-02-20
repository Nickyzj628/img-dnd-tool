import { Show } from 'solid-js';
import { useAppStore, clearError } from '@/stores/imageStore';

export default function ErrorDialog() {
  const appState = useAppStore();

  const handleClose = () => {
    clearError();
  };

  return (
    <Show when={appState().error}>
      <div class="error-overlay" onClick={handleClose}>
        <div class="error-dialog" onClick={(e) => e.stopPropagation()}>
          <div class="error-header">
            <div class="error-icon">⚠️</div>
            <h2>处理失败</h2>
          </div>

          <div class="error-content">
            <p>{appState().error?.message || '未知错误'}</p>
            <Show when={appState().error?.stack}>
              <pre class="error-stack">{appState().error?.stack}</pre>
            </Show>
          </div>

          <div class="error-actions">
            <button class="close-button" onClick={handleClose}>关闭</button>
          </div>

          <style>{
            `
            .error-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.6);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
            }
            
            .error-dialog {
              background: var(--md-sys-color-error-container);
              color: var(--md-sys-color-on-error-container);
              border-radius: 28px;
              padding: 24px;
              min-width: 400px;
              max-width: 600px;
              max-height: 80vh;
              overflow: auto;
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            }
            
            .error-header {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 16px;
            }
            
            .error-header h2 {
              margin: 0;
              font-size: 24px;
            }
            
            .error-icon {
              font-size: 32px;
            }
            
            .error-content {
              margin-bottom: 24px;
            }
            
            .error-content p {
              margin: 0 0 16px 0;
              font-size: 16px;
              line-height: 1.5;
            }
            
            .error-stack {
              background: rgba(0, 0, 0, 0.1);
              padding: 12px;
              border-radius: 8px;
              font-size: 12px;
              overflow-x: auto;
              white-space: pre-wrap;
              word-break: break-all;
              max-height: 200px;
              overflow-y: auto;
            }
            
            .error-actions {
              display: flex;
              justify-content: flex-end;
            }
            
            .close-button {
              padding: 10px 24px;
              background: var(--md-sys-color-error);
              color: white;
              border: none;
              border-radius: 20px;
              font-size: 14px;
              cursor: pointer;
              transition: all 0.2s;
            }
            
            .close-button:hover {
              opacity: 0.9;
            }
            `
          }</style>
        </div>
      </div>
    </Show>
  );
}
