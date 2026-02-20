import { Show, createSignal, onMount } from 'solid-js';
import type { Preset } from '@/types';

// 导入组件
import StepBar from '@/components/StepBar';
import DropZone from '@/components/DropZone';
import PresetSelector from '@/components/PresetSelector';
import PresetEditor from '@/components/PresetEditor';
import PreviewCompare from '@/components/PreviewCompare';
import ProcessButton from '@/components/ProcessButton';
import ExportDropZone from '@/components/ExportDropZone';
import ErrorDialog from '@/components/ErrorDialog';

// 导入状态
import { loadPresets } from '@/stores/presetStore';
import { useImageStore, useAppStore } from '@/stores/imageStore';
import { applyMaterialTheme } from '@/stores/themeStore';

function App() {
  const [showEditor, setShowEditor] = createSignal(false);
  const [editingPreset, setEditingPreset] = createSignal<Preset | null>(null);
  const imageState = useImageStore();
  const appState = useAppStore();

  onMount(() => {
    loadPresets();
    applyMaterialTheme('#0066cc', false);
  });

  const handleEditPreset = (preset: Preset) => {
    setEditingPreset(preset);
    setShowEditor(true);
  };

  const handleAddPreset = () => {
    setEditingPreset(null);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingPreset(null);
  };

  // 根据当前步骤渲染不同内容
  const renderStepContent = () => {
    const step = appState().currentStep;
    
    switch (step) {
      case 0:
        return (
          <div class="step-content">
            <DropZone />
          </div>
        );
      case 1:
        return (
          <div class="step-content">
            <div class="step-layout">
              <div class="left-panel">
                <PresetSelector
                  onEdit={handleEditPreset}
                  onAdd={handleAddPreset}
                />
              </div>
              <div class="right-panel">
                <PreviewCompare />
                <ProcessButton />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div class="step-content">
            <div class="step-layout">
              <div class="left-panel">
                <PreviewCompare />
              </div>
              <div class="right-panel">
                <ExportDropZone />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div class="app">
      <main class="app-main">
        <StepBar />
        
        <div class="content-area">
          {renderStepContent()}
        </div>
      </main>

      <Show when={showEditor()}>
        <PresetEditor
          preset={editingPreset()}
          onClose={handleCloseEditor}
        />
      </Show>

      <ErrorDialog />

      <style>{
        `
        :root {
          --md-sys-color-primary: #0066cc;
          --md-sys-color-on-primary: #ffffff;
          --md-sys-color-primary-container: #e0edff;
          --md-sys-color-on-primary-container: #001d33;
          --md-sys-color-secondary: #535f70;
          --md-sys-color-on-secondary: #ffffff;
          --md-sys-color-secondary-container: #d7e3f8;
          --md-sys-color-on-secondary-container: #101c2b;
          --md-sys-color-surface: #fdfcff;
          --md-sys-color-on-surface: #1a1c1e;
          --md-sys-color-surface-variant: #dfe2eb;
          --md-sys-color-on-surface-variant: #43474e;
          --md-sys-color-outline: #73777f;
          --md-sys-color-outline-variant: #c4c6d0;
          --md-sys-color-background: #fdfcff;
          --md-sys-color-on-background: #1a1c1e;
          --md-sys-color-error: #ba1a1a;
          --md-sys-color-error-container: #ffdad6;
          --md-sys-color-on-error-container: #410002;
          --md-sys-color-surface-dim: #dbd9dd;
          --md-sys-color-surface-container: #f0f4f9;
          --md-sys-color-surface-container-low: #f3f3f6;
          --md-sys-color-surface-container-highest: #e3e2e6;
          --md-sys-color-primary-fixed: #e0edff;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Roboto', system-ui, -apple-system, sans-serif;
          background: var(--md-sys-color-background);
          color: var(--md-sys-color-on-background);
          min-height: 100vh;
          overflow: hidden;
        }
        
        .app {
          display: flex;
          flex-direction: column;
          height: 100vh;
          padding: 12px 16px;
        }
        
        .app-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }

        .content-area {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: 4px 0;
        }

        .step-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
          height: 100%;
        }

        .step-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          height: 100%;
        }

        .left-panel,
        .right-panel {
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
        }

        .right-panel {
          justify-content: flex-start;
        }

        /* 响应式：小屏幕时改为单列 */
        @media (max-width: 900px) {
          .step-layout {
            grid-template-columns: 1fr;
          }
        }
        `
      }</style>
    </div>
  );
}

export default App;
