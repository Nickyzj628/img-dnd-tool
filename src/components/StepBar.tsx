import { Show, For } from 'solid-js';
import { useAppStore } from '@/stores/imageStore';

interface Step {
  id: number;
  title: string;
  description: string;
}

const steps: Step[] = [
  { id: 0, title: '导入', description: '选择图片' },
  { id: 1, title: '调整', description: '配置预设' },
  { id: 2, title: '导出', description: '保存结果' },
];

export default function StepBar() {
  const appState = useAppStore();
  const currentStep = () => appState().currentStep;

  return (
    <div class="step-bar">
      <For each={steps}>
        {(step, index) => (
          <div 
            class="step-item"
            classList={{
              active: currentStep() === step.id,
              completed: currentStep() > step.id,
              pending: currentStep() < step.id
            }}
          >
            <div class="step-indicator">
              <Show when={currentStep() > step.id}>
                ✓
              </Show>
              <Show when={currentStep() <= step.id}>
                {index() + 1}
              </Show>
            </div>
            <div class="step-content">
              <div class="step-title">{step.title}</div>
              <div class="step-description">{step.description}</div>
            </div>
            
            <Show when={index() < steps.length - 1}>
              <div class="step-connector"
                classList={{ 
                  completed: currentStep() > step.id,
                  active: currentStep() === step.id
                }}
              />
            </Show>
          </div>
        )}
      </For>

      <style>{
        `
        .step-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          background: var(--md-sys-color-surface-container);
          border-radius: 12px;
          margin-bottom: 16px;
        }

        .step-item {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          position: relative;
        }

        .step-indicator {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .step-item.completed .step-indicator {
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
        }

        .step-item.active .step-indicator {
          background: var(--md-sys-color-primary-container);
          color: var(--md-sys-color-on-primary-container);
          border: 2px solid var(--md-sys-color-primary);
        }

        .step-item.pending .step-indicator {
          background: var(--md-sys-color-surface-variant);
          color: var(--md-sys-color-on-surface-variant);
        }

        .step-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .step-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
        }

        .step-description {
          font-size: 11px;
          color: var(--md-sys-color-on-surface-variant);
        }

        .step-item.pending .step-title {
          color: var(--md-sys-color-on-surface-variant);
        }

        .step-item.pending .step-description {
          opacity: 0.6;
        }

        .step-connector {
          flex: 1;
          height: 2px;
          margin: 0 12px;
          background: var(--md-sys-color-outline-variant);
          transition: all 0.3s ease;
          max-width: 60px;
        }

        .step-connector.completed {
          background: var(--md-sys-color-primary);
        }

        .step-connector.active {
          background: linear-gradient(
            to right,
            var(--md-sys-color-primary) 50%,
            var(--md-sys-color-outline-variant) 50%
          );
        }
        `
      }</style>
    </div>
  );
}
