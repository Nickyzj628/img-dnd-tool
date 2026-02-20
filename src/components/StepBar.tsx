import { useAppStore } from '@/stores/imageStore';
import { goBack } from '@/stores/imageStore';

const stepNames = ['导入', '调整', '导出'];

export default function StepBar() {
  const appState = useAppStore();
  const currentStep = () => appState().currentStep;

  const progress = () => (currentStep() / (stepNames.length - 1)) * 100;
  const canGoBack = () => currentStep() > 0;

  const handleBack = () => {
    if (canGoBack()) {
      goBack();
    }
  };

  return (
    <div class="step-bar">
      <button
        class="back-button"
        onClick={handleBack}
        disabled={!canGoBack()}
        aria-label="返回上一步"
      >
        ←
      </button>
      <div class="progress-track">
        <div 
          class="progress-fill"
          style={{ width: `${progress()}%` }}
        />
      </div>
      <div class="step-info">
        <span class="step-progress">{currentStep() + 1}/{stepNames.length}</span>
        <div class="step-label">{stepNames[currentStep()]}</div>
      </div>

      <style>{`
        .step-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          margin-bottom: 12px;
        }

        .back-button {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--md-sys-color-surface-container);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          font-size: 14px;
          color: var(--md-sys-color-on-surface);
          transition: background 0.2s;
          flex-shrink: 0;
        }

        .back-button:hover:not(:disabled) {
          background: var(--md-sys-color-surface-variant);
        }

        .back-button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .back-button:focus-visible {
          outline: 2px solid var(--md-sys-color-primary);
          outline-offset: 2px;
        }

        .progress-track {
          flex: 1;
          height: 4px;
          background: var(--md-sys-color-surface-variant);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--md-sys-color-primary);
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .step-info {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: auto;
        }

        .step-progress {
          font-size: 12px;
          color: var(--md-sys-color-on-surface-variant);
          min-width: 32px;
          text-align: right;
        }

        .step-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--md-sys-color-primary);
          text-align: right;
          min-width: 40px;
        }
      `}</style>
    </div>
  );
}
