import { createSignal, Show } from 'solid-js';
import { addPreset, updatePreset } from '@/stores/presetStore';
import type { Preset } from '@/types';

interface PresetEditorProps {
  preset?: Preset | null;
  onClose: () => void;
}

const ASPECT_RATIO_OPTIONS = [
  { value: '', label: '不指定' },
  { value: '16:9', label: '16:9' },
  { value: '4:3', label: '4:3' },
  { value: '21:9', label: '21:9' },
];

export default function PresetEditor(props: PresetEditorProps) {
  const isEditing = () => !!props.preset;
  
  const [name, setName] = createSignal(props.preset?.name || '');
  const [format, setFormat] = createSignal<Preset['format']>(props.preset?.format || 'webp');
  const [width, setWidth] = createSignal<number | ''>(props.preset?.width ?? '');
  const [height, setHeight] = createSignal<number | ''>(props.preset?.height ?? '');
  const [targetSizeKB, setTargetSizeKB] = createSignal<number | ''>(
    props.preset?.targetSize ? Math.round(props.preset.targetSize / 1024) : ''
  );
  const [aspectRatio, setAspectRatio] = createSignal<string>(props.preset?.aspectRatio || '');

  const handleSubmit = async () => {
    if (!name().trim()) {
      alert('请输入预设名称');
      return;
    }

    const presetData = {
      name: name().trim(),
      format: format(),
      width: width() === '' ? null : Number(width()),
      height: height() === '' ? null : Number(height()),
      targetSize: targetSizeKB() === '' ? null : Number(targetSizeKB()) * 1024,
      aspectRatio: aspectRatio() || null,
    };

    try {
      if (isEditing() && props.preset) {
        await updatePreset(props.preset.id, presetData);
      } else {
        await addPreset(presetData);
      }
      props.onClose();
    } catch (error) {
      console.error('保存失败:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert('保存预设失败: ' + errorMessage);
    }
  };

  return (
    <div class="preset-editor-overlay" onClick={props.onClose}>
      <div class="preset-editor" onClick={(e) => e.stopPropagation()}>
        <h2>{isEditing() ? '编辑预设' : '添加预设'}</h2>

        <div class="form-content">
          <div class="form-field">
            <label>预设名称</label>
            <input
              type="text"
              value={name()}
              onInput={(e) => setName(e.target.value)}
              placeholder="例如：社交媒体优化"
            />
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>目标格式</label>
              <select value={format()} onChange={(e) => setFormat(e.target.value as Preset['format'])}>
                <option value="webp">WebP</option>
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
              </select>
            </div>

            <div class="form-field">
              <label>比例</label>
              <select value={aspectRatio()} onChange={(e) => setAspectRatio(e.target.value)}>
                {ASPECT_RATIO_OPTIONS.map(option => (
                  <option value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>宽度 (px，留空保持原宽)</label>
              <input
                type="number"
                min="100"
                max="8192"
                value={width()}
                onInput={(e) => {
                  const val = e.target.value;
                  setWidth(val === '' ? '' : parseInt(val) || '');
                }}
                placeholder="保持原宽"
              />
            </div>

            <div class="form-field">
              <label>高度 (px，留空保持原高)</label>
              <input
                type="number"
                min="100"
                max="8192"
                value={height()}
                onInput={(e) => {
                  const val = e.target.value;
                  setHeight(val === '' ? '' : parseInt(val) || '');
                }}
                placeholder="保持原高"
              />
            </div>
          </div>

          <div class="form-field">
            <label>目标大小 (KB，留空不限制)</label>
            <input
              type="number"
              min="10"
              max="10240"
              value={targetSizeKB()}
              onInput={(e) => {
                const val = e.target.value;
                setTargetSizeKB(val === '' ? '' : parseInt(val) || '');
              }}
              placeholder="不限制"
            />
          </div>
        </div>

        <div class="form-actions">
          <button class="cancel-button" onClick={props.onClose}>取消</button>
          <button class="save-button" onClick={handleSubmit}>保存</button>
        </div>
      </div>

      <style>{`
        .preset-editor-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .preset-editor {
          background: var(--md-sys-color-surface);
          border-radius: 28px;
          padding: 24px;
          width: 95%;
          height: 90%;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
        }
        
        .preset-editor h2 {
          margin: 0 0 20px 0;
          font-size: 24px;
          color: var(--md-sys-color-on-surface);
          flex-shrink: 0;
        }

        .form-content {
          overflow-y: auto;
          flex: 1;
        }
        
        .form-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }
        
        .form-field label {
          font-size: 14px;
          font-weight: 500;
          color: var(--md-sys-color-on-surface-variant);
        }
        
        .form-field input,
        .form-field select {
          padding: 12px 16px;
          border: 1px solid var(--md-sys-color-outline);
          border-radius: 8px;
          font-size: 16px;
          background: var(--md-sys-color-surface-container-highest);
          color: var(--md-sys-color-on-surface);
        }
        
        .form-field input::placeholder {
          color: var(--md-sys-color-on-surface-variant);
          opacity: 0.6;
        }
        
        .form-field input:focus,
        .form-field select:focus {
          outline: none;
          border-color: var(--md-sys-color-primary);
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 24px;
          flex-shrink: 0;
        }
        
        .cancel-button {
          padding: 10px 20px;
          background: transparent;
          color: var(--md-sys-color-primary);
          border: 1px solid var(--md-sys-color-outline);
          border-radius: 20px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .cancel-button:hover {
          background: var(--md-sys-color-surface-container-highest);
        }
        
        .save-button {
          padding: 10px 24px;
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          border: none;
          border-radius: 20px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        
        .save-button:hover {
          background: var(--md-sys-color-primary-container);
          color: var(--md-sys-color-on-primary-container);
        }
      `}</style>
    </div>
  );
}
