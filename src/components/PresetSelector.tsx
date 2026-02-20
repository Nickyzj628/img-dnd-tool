import { For, Show } from 'solid-js';
import { 
  usePresets, 
  useCurrentPresetId, 
  selectPreset,
  deletePreset 
} from '@/stores/presetStore';
import type { Preset } from '@/types';

interface PresetSelectorProps {
  onEdit: (preset: Preset) => void;
  onAdd: () => void;
}

export default function PresetSelector(props: PresetSelectorProps) {
  const presets = usePresets();
  const currentId = useCurrentPresetId();

  const formatFileSize = (bytes: number | null): string => {
    if (bytes === null) return '不限制';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDimension = (value: number | null, label: string): string => {
    if (value === null) return `保持原${label}`;
    return `${value}px`;
  };

  return (
    <div class="preset-selector">
      <div class="preset-header">
        <h3>处理预设</h3>
        <button class="add-button" onClick={props.onAdd}>
          <span class="button-icon">+</span>
          添加预设
        </button>
      </div>

      <div class="preset-list">
        <For each={presets()}>
          {(preset) => (
            <div 
              class="preset-item"
              classList={{ active: preset.id === currentId() }}
              onClick={() => selectPreset(preset.id)}
            >
              <div class="preset-info">
                <div class="preset-name">{preset.name}</div>
                <div class="preset-details">
                  {formatDimension(preset.width, '宽')} × {formatDimension(preset.height, '高')} · {preset.format.toUpperCase()} · {formatFileSize(preset.targetSize)}
                </div>
              </div>
              
              <div class="preset-actions">
                <button 
                  class="action-button edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    props.onEdit(preset);
                  }}
                >
                  ✏️
                </button>
                
                <Show when={preset.id !== 'default'}>
                  <button 
                    class="action-button delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePreset(preset.id);
                    }}
                  >
                    🗑️
                  </button>
                </Show>
              </div>
            </div>
          )}
        </For>
      </div>

      <style>{
        `
        .preset-selector {
          background: var(--md-sys-color-surface-container-low);
          border-radius: 16px;
          padding: 16px;
        }
        
        .preset-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .preset-header h3 {
          margin: 0;
          font-size: 18px;
          color: var(--md-sys-color-on-surface);
        }
        
        .add-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: transparent;
          color: var(--md-sys-color-primary);
          border: 1px solid var(--md-sys-color-outline);
          border-radius: 20px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .add-button:hover {
          background: var(--md-sys-color-primary-container);
          border-color: var(--md-sys-color-primary);
        }
        
        .button-icon {
          font-size: 18px;
          font-weight: 300;
        }
        
        .preset-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .preset-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          background: var(--md-sys-color-surface);
        }
        
        .preset-item:hover {
          background: var(--md-sys-color-surface-container-highest);
        }
        
        .preset-item.active {
          background: var(--md-sys-color-primary-container);
          color: var(--md-sys-color-on-primary-container);
        }
        
        .preset-name {
          font-weight: 500;
          font-size: 14px;
          margin-bottom: 4px;
        }
        
        .preset-details {
          font-size: 12px;
          opacity: 0.7;
        }
        
        .preset-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s;
        }
        
        .preset-item:hover .preset-actions {
          opacity: 1;
        }
        
        .action-button {
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 8px;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        
        .action-button:hover {
          background: rgba(0, 0, 0, 0.1);
        }
        `
      }</style>
    </div>
  );
}
