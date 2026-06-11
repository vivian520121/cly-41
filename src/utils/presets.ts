import { AnimationPreset, PresetParams, AnimationParams } from '@/types';

export const officialPresets: AnimationPreset[] = [
  {
    id: 'preset-elastic-bounce',
    name: '弹性弹跳',
    category: 'bounce',
    description: '带有明显弹性效果的弹跳动画，充满活力',
    params: {
      duration: 0.8,
      easing: 'elastic',
      strokeWidth: 2,
      loopCount: 0,
    },
    isCustom: false,
  },
  {
    id: 'preset-smooth-rotate',
    name: '丝滑旋转',
    category: 'rotate',
    description: '平滑流畅的圆周旋转运动',
    params: {
      duration: 2,
      easing: 'ease-in-out',
      strokeWidth: 2,
      loopCount: 0,
    },
    isCustom: false,
  },
  {
    id: 'preset-sharp-pulse',
    name: '急停脉冲',
    category: 'pulse',
    description: '快速冲击后急停的脉冲效果',
    params: {
      duration: 0.4,
      easing: 'ease-out',
      strokeWidth: 3,
      loopCount: 0,
    },
    isCustom: false,
  },
  {
    id: 'preset-gentle-breath',
    name: '轻柔呼吸',
    category: 'pulse',
    description: '舒缓柔和的呼吸式渐变动画',
    params: {
      duration: 3,
      easing: 'ease-in-out',
      strokeWidth: 1.5,
      loopCount: 0,
    },
    isCustom: false,
  },
  {
    id: 'preset-mechanical-beat',
    name: '机械节拍',
    category: 'mechanical',
    description: '精准均匀的线性节拍运动',
    params: {
      duration: 1,
      easing: 'linear',
      strokeWidth: 2,
      loopCount: 0,
    },
    isCustom: false,
  },
  {
    id: 'preset-water-ripple',
    name: '水波荡漾',
    category: 'nature',
    description: '如水波般轻柔扩散的波动效果',
    params: {
      duration: 1.6,
      easing: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
      strokeWidth: 1.5,
      loopCount: 0,
    },
    isCustom: false,
  },
  {
    id: 'preset-lightning-flash',
    name: '闪电闪烁',
    category: 'pulse',
    description: '极速闪电般的高频闪烁效果',
    params: {
      duration: 0.15,
      easing: 'linear',
      strokeWidth: 3,
      loopCount: 0,
    },
    isCustom: false,
  },
  {
    id: 'preset-pendulum-swing',
    name: '钟摆摆动',
    category: 'nature',
    description: '模仿钟摆自然摆动的缓动效果',
    params: {
      duration: 1.8,
      easing: 'ease-in-out',
      strokeWidth: 2,
      loopCount: 0,
    },
    isCustom: false,
  },
  {
    id: 'preset-jelly-wobble',
    name: '果冻抖动',
    category: 'bounce',
    description: '果冻般Q弹的软萌抖动效果',
    params: {
      duration: 0.6,
      easing: 'bounce',
      strokeWidth: 2.5,
      loopCount: 0,
    },
    isCustom: false,
  },
  {
    id: 'preset-quick-pulse',
    name: '快速脉冲',
    category: 'pulse',
    description: '快速紧凑的脉冲收缩动画',
    params: {
      duration: 0.25,
      easing: 'ease-in',
      strokeWidth: 2,
      loopCount: 0,
    },
    isCustom: false,
  },
  {
    id: 'preset-slow-fade',
    name: '缓慢渐入',
    category: 'smooth',
    description: '极其缓慢优雅的淡入效果',
    params: {
      duration: 4,
      easing: 'ease-in',
      strokeWidth: 1,
      loopCount: 1,
    },
    isCustom: false,
  },
  {
    id: 'preset-spin-pulse',
    name: '旋转脉冲',
    category: 'rotate',
    description: '旋转与脉冲相结合的复合效果',
    params: {
      duration: 1.2,
      easing: 'ease-in-out',
      strokeWidth: 2.5,
      loopCount: 0,
    },
    isCustom: false,
  },
  {
    id: 'preset-natural-sway',
    name: '自然摇摆',
    category: 'nature',
    description: '如微风拂柳般的自然摇摆',
    params: {
      duration: 2.5,
      easing: 'ease-in-out',
      strokeWidth: 1.5,
      loopCount: 0,
    },
    isCustom: false,
  },
  {
    id: 'preset-quick-bounce',
    name: '快速弹跳',
    category: 'bounce',
    description: '短促有力的连续弹跳效果',
    params: {
      duration: 0.35,
      easing: 'bounce',
      strokeWidth: 2,
      loopCount: 0,
    },
    isCustom: false,
  },
  {
    id: 'preset-smooth-loop',
    name: '平滑循环',
    category: 'smooth',
    description: '丝滑无缝的循环过渡动画',
    params: {
      duration: 1.5,
      easing: 'ease-in-out',
      strokeWidth: 2,
      loopCount: 0,
    },
    isCustom: false,
  },
  {
    id: 'preset-bouncy-pulse',
    name: '弹跳脉冲',
    category: 'bounce',
    description: '弹跳与脉冲叠加的动感效果',
    params: {
      duration: 0.5,
      easing: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
      strokeWidth: 3,
      loopCount: 0,
    },
    isCustom: false,
  },
  {
    id: 'preset-gear-rotate',
    name: '齿轮转动',
    category: 'mechanical',
    description: '模拟机械齿轮匀速转动',
    params: {
      duration: 3,
      easing: 'linear',
      strokeWidth: 2,
      loopCount: 0,
    },
    isCustom: false,
  },
  {
    id: 'preset-heartbeat',
    name: '心跳节律',
    category: 'pulse',
    description: '模拟真实心跳的双拍节奏',
    params: {
      duration: 0.8,
      easing: 'ease-in-out',
      strokeWidth: 2.5,
      loopCount: 0,
    },
    isCustom: false,
  },
];

const CUSTOM_PRESETS_STORAGE_KEY = 'svg-loader-custom-presets';

export const loadCustomPresets = (): AnimationPreset[] => {
  try {
    const stored = localStorage.getItem(CUSTOM_PRESETS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveCustomPresets = (presets: AnimationPreset[]): void => {
  try {
    localStorage.setItem(CUSTOM_PRESETS_STORAGE_KEY, JSON.stringify(presets));
  } catch {
    console.error('Failed to save custom presets');
  }
};

export const getAllPresets = (): AnimationPreset[] => {
  return [...officialPresets, ...loadCustomPresets()];
};

export const getPresetById = (id: string): AnimationPreset | undefined => {
  return getAllPresets().find((p) => p.id === id);
};

export const addCustomPreset = (
  name: string,
  description: string,
  params: PresetParams
): AnimationPreset => {
  const customPresets = loadCustomPresets();
  const newPreset: AnimationPreset = {
    id: `preset-custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    category: 'custom',
    params: { ...params },
    isCustom: true,
    createdAt: Date.now(),
  };
  customPresets.push(newPreset);
  saveCustomPresets(customPresets);
  return newPreset;
};

export const updateCustomPreset = (
  id: string,
  updates: Partial<Pick<AnimationPreset, 'name' | 'description' | 'params'>>
): AnimationPreset | null => {
  const customPresets = loadCustomPresets();
  const index = customPresets.findIndex((p) => p.id === id);
  if (index === -1) return null;

  customPresets[index] = {
    ...customPresets[index],
    ...updates,
    params: updates.params ? { ...updates.params } : customPresets[index].params,
  };
  saveCustomPresets(customPresets);
  return customPresets[index];
};

export const deleteCustomPreset = (id: string): boolean => {
  const customPresets = loadCustomPresets();
  const filtered = customPresets.filter((p) => p.id !== id);
  if (filtered.length === customPresets.length) return false;
  saveCustomPresets(filtered);
  return true;
};

export const applyPresetToParams = (
  preset: AnimationPreset,
  baseParams: AnimationParams
): AnimationParams => {
  return {
    ...baseParams,
    duration: preset.params.duration,
    easing: preset.params.easing,
    strokeWidth: preset.params.strokeWidth,
    loopCount: preset.params.loopCount,
  };
};

export const extractPresetParams = (params: AnimationParams): PresetParams => {
  return {
    duration: params.duration,
    easing: params.easing,
    strokeWidth: params.strokeWidth,
    loopCount: params.loopCount,
  };
};

export const presetCategoryLabels: Record<AnimationPreset['category'], string> = {
  bounce: '弹跳类',
  smooth: '平滑类',
  pulse: '脉冲类',
  rotate: '旋转类',
  nature: '自然类',
  mechanical: '机械类',
  custom: '自定义',
};
