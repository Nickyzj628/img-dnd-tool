import { createSignal, For, Show } from 'solid-js';
import { 
  usePresets, 
  useCurrentPresetId,
  useResetVersion,
  selectPreset,
  deletePreset,
  reorderPresets
} from '@/stores/presetStore';
import type { Preset } from '@/types';
import { useAppStore } from '@/stores/imageStore';
import { 
  DragDropProvider, 
  DragDropSensors,
  DragOverlay,
  SortableProvider,
  createSortable,
  closestCenter,
  transformStyle
} from '@thisbeyond/solid-dnd';

interface PresetSelectorProps {
  onEdit: (preset: Preset) => void;
  onAdd: () => void;
  onReset: () => void;
}

// 可排序预设项组件
function SortablePresetItem(props: {
  preset: Preset;
  isActive: boolean;
  isProcessing: boolean;
  onSelect: () => void;
  onEdit: (e: Event) => void;
  onDelete: (e: Event) => void;
}) {
  console.log('[SortablePresetItem] 组件渲染/更新:', props.preset.id);
  
  const sortable = createSortable(props.preset.id);
  
  console.log('[SortablePresetItem] createSortable 返回值:', {
    id: props.preset.id,
    isFunction: typeof sortable === 'function',
    dragActivators: sortable.dragActivators ? Object.keys(sortable.dragActivators) : 'none',
    isActiveDraggable: sortable.isActiveDraggable,
    transform: sortable.transform
  });
  
  return (
    <div
      ref={sortable}
      style={transformStyle(sortable.transform)}
      class="preset-item-wrapper"
      classList={{
        'is-dragging': sortable.isActiveDraggable,
        'transition-transform': !sortable.isActiveDraggable,
      }}
    >
      <div 
        class="preset-item"
        classList={{ 
          active: props.isActive,
        }}
        onClick={() => !props.isProcessing && !sortable.isActiveDraggable && props.onSelect()}
      >
        <Show when={!props.isProcessing}>
          <div 
            {...sortable.dragActivators}
            class="drag-handle"
            classList={{ 'is-dragging': sortable.isActiveDraggable }}
            title="拖动排序"
            onPointerDown={(e) => console.log('[DragHandle] onPointerDown:', props.preset.id, e.pointerId)}
            onPointerUp={(e) => console.log('[DragHandle] onPointerUp:', props.preset.id, e.pointerId)}
            onPointerMove={(e) => console.log('[DragHandle] onPointerMove:', props.preset.id, {x: e.clientX, y: e.clientY})}
          >
            ⋮⋮
          </div>
        </Show>
        
        <div class="preset-info">
          <div class="preset-name">{props.preset.name}</div>
          <div class="preset-details">
            {props.preset.width ?? '保持原宽'} × {props.preset.height ?? '保持原高'} · {props.preset.format?.toUpperCase() || '原图格式'} · {props.preset.targetSize ? `${Math.round(props.preset.targetSize / 1024)}KB` : '不限制'}
          </div>
        </div>
        
        <Show when={!props.isProcessing}>
          <div class="preset-actions">
            <button 
              class="action-button edit"
              onClick={props.onEdit}
            >
              ✏️
            </button>
            
            <button 
              class="action-button delete"
              onClick={props.onDelete}
            >
              🗑️
            </button>
          </div>
        </Show>
      </div>
    </div>
  );
}

// 拖拽时的浮动层内容
function DragOverlayContent(props: { preset: Preset }) {
  return (
    <div class="preset-item is-dragging-overlay">
      <div class="drag-handle">⋮⋮</div>
      <div class="preset-info">
        <div class="preset-name">{props.preset.name}</div>
        <div class="preset-details">
          {props.preset.width ?? '保持原宽'} × {props.preset.height ?? '保持原高'} · {props.preset.format?.toUpperCase() || '原图格式'}
        </div>
      </div>
    </div>
  );
}

export default function PresetSelector(props: PresetSelectorProps) {
  const presets = usePresets();
  const currentId = useCurrentPresetId();
  const resetVersion = useResetVersion();
  const appState = useAppStore();
  const [activeId, setActiveId] = createSignal<string | null>(null);
  
  // 监听重置版本变化，触发重新挂载 SortableProvider
  const version = resetVersion();
  
  const isProcessing = () => appState().isProcessing;

  // 获取预设ID列表用于 SortableProvider
  const ids = () => presets().map(p => p.id);
  
  // 根据ID获取预设
  const getPresetById = (id: string) => presets().find(p => p.id === id);

  const onDragStart = (event: any) => {
    console.log('[DragDropProvider] onDragStart:', {
      draggableId: event?.draggable?.id,
      draggable: event?.draggable,
      event: event
    });
    if (event?.draggable?.id) {
      setActiveId(String(event.draggable.id));
    }
  };

  const onDragMove = (event: any) => {
    console.log('[DragDropProvider] onDragMove:', {
      draggableId: event?.draggable?.id,
      position: event?.draggable?.transform
    });
  };

  const onDragEnd = (event: any) => {
    console.log('[DragDropProvider] onDragEnd:', {
      draggableId: event?.draggable?.id,
      droppableId: event?.droppable?.id,
      event: event
    });
    
    const { draggable, droppable } = event;
    
    if (draggable && droppable && draggable.id !== droppable.id) {
      const currentPresets = [...presets()];
      const fromIndex = currentPresets.findIndex(p => p.id === String(draggable.id));
      const toIndex = currentPresets.findIndex(p => p.id === String(droppable.id));
      
      console.log('[onDragEnd] fromIndex:', fromIndex, 'toIndex:', toIndex);
      
      if (fromIndex !== -1 && toIndex !== -1) {
        const [movedItem] = currentPresets.splice(fromIndex, 1);
        currentPresets.splice(toIndex, 0, movedItem);
        reorderPresets(currentPresets);
      }
    }
    
    setActiveId(null);
  };

  return (
    <div class="preset-selector" classList={{ 'is-processing': isProcessing() }}>
      <div class="preset-header">
        <h3>选择预设</h3>
        <Show when={!isProcessing()}>
          <div class="header-actions">
            <button 
              class="reset-button" 
              onClick={() => {
                console.log('[ResetButton] 点击重置按钮');
                props.onReset();
              }}
            >
              重置
            </button>
            <button class="add-button" onClick={props.onAdd}>
              新增
            </button>
          </div>
        </Show>
      </div>

      {/* 使用 version 强制重建整个拖拽系统 */}
      {(() => {
        // 读取 version 触发重新计算
        const v = version;
        console.log('[DragDropProvider] 重建整个拖拽系统, version:', v);
        return (
          <DragDropProvider
            onDragStart={onDragStart}
            onDragMove={onDragMove}
            onDragEnd={onDragEnd}
            collisionDetector={closestCenter}
          >
            <DragDropSensors />
            <div class="preset-list">
              <SortableProvider ids={ids()}>
                <For each={presets()}>
                  {(preset) => {
                    console.log('[For] 渲染预设项:', preset.id, preset.name);
                    return (
                      <SortablePresetItem
                        preset={preset}
                        isActive={preset.id === currentId()}
                        isProcessing={isProcessing()}
                        onSelect={() => selectPreset(preset.id)}
                        onEdit={(e) => {
                          e.stopPropagation();
                          props.onEdit(preset);
                        }}
                        onDelete={(e) => {
                          e.stopPropagation();
                          deletePreset(preset.id);
                        }}
                      />
                    );
                  }}
                </For>
              </SortableProvider>
            </div>
            <DragOverlay>
              {() => {
                const id = activeId();
                console.log('[DragOverlay] 渲染:', { activeId: id });
                if (!id) return null;
                const preset = getPresetById(id);
                console.log('[DragOverlay] 找到预设:', preset?.name);
                return preset ? <DragOverlayContent preset={preset} /> : null;
              }}
            </DragOverlay>
          </DragDropProvider>
        );
      })()}

      <style>{
        `
        .preset-selector {
          background: var(--md-sys-color-surface-container-low);
          border-radius: 16px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          position: relative;
        }
        
        .preset-selector.is-processing::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 16px;
          pointer-events: auto;
          cursor: wait;
        }
        
        .preset-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          flex-shrink: 0;
        }
        
        .preset-header h3 {
          margin: 0;
          font-size: 18px;
          color: var(--md-sys-color-on-surface);
        }
        
        .header-actions {
          display: flex;
          gap: 8px;
        }
        
        .add-button,
        .reset-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: transparent;
          border: 1px solid var(--md-sys-color-outline);
          border-radius: 20px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
        }
        
        .add-button {
          color: var(--md-sys-color-primary);
        }
        
        .add-button:hover {
          background: var(--md-sys-color-primary-container);
          border-color: var(--md-sys-color-primary);
        }
        
        .reset-button {
          color: var(--md-sys-color-on-surface-variant);
        }
        
        .reset-button:hover {
          background: var(--md-sys-color-surface-container-highest);
          border-color: var(--md-sys-color-on-surface-variant);
        }
        
        .preset-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
          overflow-y: auto;
          padding-right: 4px;
          min-height: 0;
        }
        
        .preset-list::-webkit-scrollbar {
          width: 6px;
        }
        
        .preset-list::-webkit-scrollbar-track {
          background: var(--md-sys-color-surface-container);
          border-radius: 3px;
        }
        
        .preset-list::-webkit-scrollbar-thumb {
          background: var(--md-sys-color-outline);
          border-radius: 3px;
        }
        
        .preset-list::-webkit-scrollbar-thumb:hover {
          background: var(--md-sys-color-on-surface-variant);
        }
        
        .preset-item-wrapper {
          position: relative;
          display: block;
        }
        
        .preset-item-wrapper.transition-transform {
          transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1);
        }
        
        .preset-item-wrapper.is-dragging {
          opacity: 0.4;
          z-index: 10;
        }
        
        .preset-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-radius: 12px;
          transition: background 0.2s, opacity 0.2s;
          background: var(--md-sys-color-surface);
          user-select: none;
          border: 2px solid transparent;
        }
        
        .preset-item:hover {
          background: var(--md-sys-color-surface-container-highest);
        }
        
        .preset-item.active {
          background: var(--md-sys-color-primary-container);
          color: var(--md-sys-color-on-primary-container);
        }
        
        .preset-item.is-dragging-overlay {
          background: var(--md-sys-color-surface);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          border-radius: 12px;
          cursor: grabbing;
          opacity: 0.95;
        }
        
        .drag-handle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          margin-right: 12px;
          cursor: grab;
          color: var(--md-sys-color-outline);
          font-size: 14px;
          user-select: none;
          border-radius: 4px;
          transition: background 0.2s, color 0.2s, opacity 0.2s;
          touch-action: none;
        }
        
        .drag-handle:hover {
          background: var(--md-sys-color-surface-container);
          color: var(--md-sys-color-on-surface-variant);
        }
        
        .drag-handle.is-dragging {
          cursor: grabbing;
        }
        
        .preset-info {
          flex: 1;
          min-width: 0;
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
        
        .preset-selector.is-processing .preset-item {
          cursor: not-allowed;
        }
        
        .preset-selector.is-processing .action-button {
          pointer-events: none;
          opacity: 0.5;
        }
        `
      }</style>
    </div>
  );
}
