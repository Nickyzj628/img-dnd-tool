import { createSignal } from 'solid-js';
import { Preset } from '@/types';
import { appConfigDir } from '@tauri-apps/api/path';
import { readTextFile, writeTextFile, exists, mkdir, BaseDirectory } from '@tauri-apps/plugin-fs';

const DEFAULT_PRESETS: Preset[] = [
  {
    id: 'default',
    name: '默认预设',
    format: 'webp',
    width: 1280,
    height: 720,
    targetSize: 307200,
  },
];

const PRESETS_FILE = 'presets.json';

const [presets, setPresets] = createSignal<Preset[]>(DEFAULT_PRESETS);
const [currentPresetId, setCurrentPresetId] = createSignal<string>('default');

export const getCurrentPreset = () => {
  return presets().find(p => p.id === currentPresetId()) || presets()[0];
};

export const loadPresets = async () => {
  try {
    const configDir = await appConfigDir();
    const filePath = `${configDir}/${PRESETS_FILE}`;
    
    const fileExists = await exists(filePath);
    if (fileExists) {
      const content = await readTextFile(filePath);
      const loadedPresets = JSON.parse(content);
      setPresets(loadedPresets);
    } else {
      await savePresets(DEFAULT_PRESETS);
    }
  } catch (error) {
    console.error('加载预设失败:', error);
    setPresets(DEFAULT_PRESETS);
  }
};

export const savePresets = async (newPresets: Preset[]) => {
  try {
    const configDir = await appConfigDir();
    const filePath = `${configDir}/${PRESETS_FILE}`;
    
    try {
      const dirExists = await exists(configDir);
      if (!dirExists) {
        await mkdir('', { baseDir: BaseDirectory.AppConfig, recursive: true });
      }
    } catch (e) {
      console.log('目录创建:', e);
    }
    
    await writeTextFile(filePath, JSON.stringify(newPresets, null, 2));
    setPresets(newPresets);
  } catch (error) {
    console.error('保存预设失败:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`保存失败: ${errorMessage}`);
  }
};

export const addPreset = async (preset: Omit<Preset, 'id'>) => {
  const newPreset: Preset = {
    ...preset,
    id: `preset_${Date.now()}`,
  };
  const newPresets = [...presets(), newPreset];
  await savePresets(newPresets);
  setCurrentPresetId(newPreset.id);
};

export const updatePreset = async (id: string, updates: Partial<Preset>) => {
  const newPresets = presets().map(p => 
    p.id === id ? { ...p, ...updates } : p
  );
  await savePresets(newPresets);
};

export const deletePreset = async (id: string) => {
  if (id === 'default') return;
  const newPresets = presets().filter(p => p.id !== id);
  await savePresets(newPresets);
  if (currentPresetId() === id) {
    setCurrentPresetId('default');
  }
};

export const selectPreset = (id: string) => {
  setCurrentPresetId(id);
};

export const usePresets = () => presets;
export const useCurrentPresetId = () => currentPresetId;
