import { create } from 'zustand';
import {
  AnimationParams,
  FavoriteItem,
  PreviewBackground,
  ViewMode,
  ToastMessage,
  TimelineState,
  Keyframe,
  AnimationLayer,
  TransformParams,
  BezierCurve,
  defaultTransformParams,
  defaultBezierCurve,
  CustomTemplate,
  CanvasElement,
  CanvasAnimation,
  TemplateCategory,
} from '@/types';
import { allTemplates, getTemplateById } from '@/templates';
import { generateTimelineSVG } from '@/utils/timelineRenderer';
import { elementsToSVG } from '@/utils/svgParser';
import { getTemplateFromCurrentURL } from '@/utils/shareUtils';

let playbackIntervalId: number | null = null;
let playbackStartTime: number = 0;
let playbackStartPosition: number = 0;

interface AppState {
  selectedTemplateId: string;
  currentParams: AnimationParams;
  svgCode: string;
  previewBackground: PreviewBackground;
  viewMode: ViewMode;
  favorites: FavoriteItem[];
  toasts: ToastMessage[];
  selectedCategory: string;
  searchQuery: string;
  isCustomCode: boolean;
  timeline: TimelineState;
  customTemplates: CustomTemplate[];
  canvasElements: CanvasElement[];
  selectedElementId: string | null;
  editingTemplateId: string | null;

  selectTemplate: (templateId: string) => void;
  updateParams: (params: Partial<AnimationParams>) => void;
  resetParams: () => void;
  setSvgCode: (code: string) => void;
  setPreviewBackground: (bg: PreviewBackground) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleFavorite: (templateId: string, params: AnimationParams) => void;
  removeFavorite: (id: string) => void;
  addToast: (message: string, type: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setIsCustomCode: (value: boolean) => void;
  generateSVG: () => void;

  setTimelineEnabled: (enabled: boolean) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setTimelineDuration: (duration: number) => void;
  setTimelineZoom: (zoom: number) => void;
  selectLayer: (layerId: string | null) => void;
  selectKeyframe: (layerId: string | null, keyframeId: string | null) => void;
  toggleLayerVisibility: (layerId: string) => void;
  toggleLayerLock: (layerId: string) => void;
  addLayer: (layer: Omit<AnimationLayer, 'id'>) => void;
  removeLayer: (layerId: string) => void;
  updateLayerName: (layerId: string, name: string) => void;
  updateLayerPhaseOffset: (layerId: string, offset: number) => void;
  addKeyframe: (layerId: string, time: number, transform?: Partial<TransformParams>) => void;
  removeKeyframe: (layerId: string, keyframeId: string) => void;
  updateKeyframeTime: (layerId: string, keyframeId: string, time: number) => void;
  updateKeyframeTransform: (layerId: string, keyframeId: string, transform: Partial<TransformParams>) => void;
  updateKeyframeEasing: (layerId: string, keyframeId: string, property: keyof Keyframe['easing'], curve: BezierCurve) => void;
  updateCurrentTransform: (transform: Partial<TransformParams>) => void;
  duplicateKeyframe: (layerId: string, keyframeId: string, newTime: number) => void;
  initializeTimelineFromTemplate: (templateId: string) => void;
  generateTimelineSVGCode: () => void;

  addCustomTemplate: (template: CustomTemplate) => void;
  updateCustomTemplate: (id: string, updates: Partial<CustomTemplate>) => void;
  deleteCustomTemplate: (id: string) => void;
  loadSharedTemplate: () => void;
  addCanvasElement: (element: CanvasElement) => void;
  updateCanvasElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteCanvasElement: (id: string) => void;
  setSelectedElementId: (id: string | null) => void;
  addElementAnimation: (elementId: string, animation: CanvasAnimation) => void;
  updateElementAnimation: (elementId: string, animId: string, updates: Partial<CanvasAnimation>) => void;
  deleteElementAnimation: (elementId: string, animId: string) => void;
  setCanvasElements: (elements: CanvasElement[]) => void;
  setEditingTemplateId: (id: string | null) => void;
  enterWorkbench: (templateId?: string) => void;
  saveWorkbenchAsTemplate: (name: string, category: string, description: string) => void;
  generateCanvasSVG: () => void;
  getCustomTemplateById: (id: string) => CustomTemplate | undefined;
}

const defaultTemplate = allTemplates[0];

const loadFavoritesFromStorage = (): FavoriteItem[] => {
  try {
    const stored = localStorage.getItem('svg-loader-favorites');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveFavoritesToStorage = (favorites: FavoriteItem[]) => {
  try {
    localStorage.setItem('svg-loader-favorites', JSON.stringify(favorites));
  } catch {
    console.error('Failed to save favorites');
  }
};

const loadCustomTemplatesFromStorage = (): CustomTemplate[] => {
  try {
    const stored = localStorage.getItem('svg-loader-custom-templates');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveCustomTemplatesToStorage = (templates: CustomTemplate[]) => {
  try {
    localStorage.setItem('svg-loader-custom-templates', JSON.stringify(templates));
  } catch {
    console.error('Failed to save custom templates');
  }
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const createDefaultEasing = () => ({
  x: { ...defaultBezierCurve },
  y: { ...defaultBezierCurve },
  scaleX: { ...defaultBezierCurve },
  scaleY: { ...defaultBezierCurve },
  rotation: { ...defaultBezierCurve },
  opacity: { ...defaultBezierCurve },
});

const createKeyframe = (time: number, transform: Partial<TransformParams> = {}): Keyframe => ({
  id: generateId(),
  time,
  transform: { ...defaultTransformParams, ...transform },
  easing: createDefaultEasing(),
});

const defaultTimeline: TimelineState = {
  enabled: false,
  currentTime: 0,
  isPlaying: false,
  duration: 2,
  zoom: 1,
  selectedLayerId: null,
  selectedKeyframeId: null,
  layers: [],
};

export const useAppStore = create<AppState>((set, get) => ({
  selectedTemplateId: defaultTemplate.id,
  currentParams: { ...defaultTemplate.defaultParams },
  svgCode: defaultTemplate.generate(defaultTemplate.defaultParams),
  previewBackground: 'dark',
  viewMode: 'templates',
  favorites: loadFavoritesFromStorage(),
  toasts: [],
  selectedCategory: 'all',
  searchQuery: '',
  isCustomCode: false,
  timeline: { ...defaultTimeline },
  customTemplates: loadCustomTemplatesFromStorage(),
  canvasElements: [],
  selectedElementId: null,
  editingTemplateId: null,

  selectTemplate: (templateId: string) => {
    const template = getTemplateById(templateId);
    if (template) {
      set({
        selectedTemplateId: templateId,
        currentParams: { ...template.defaultParams },
        isCustomCode: false,
      });
      get().initializeTimelineFromTemplate(templateId);
      get().generateSVG();
      return;
    }
    const customTemplate = get().getCustomTemplateById(templateId);
    if (customTemplate) {
      set({
        selectedTemplateId: templateId,
        currentParams: { ...customTemplate.defaultParams },
        svgCode: customTemplate.svgCode,
        isCustomCode: true,
      });
    }
  },

  updateParams: (params: Partial<AnimationParams>) => {
    const newParams = { ...get().currentParams, ...params };
    set({ currentParams: newParams, isCustomCode: false });
    if (params.duration) {
      set((state) => ({
        timeline: { ...state.timeline, duration: params.duration as number },
      }));
    }
    get().generateSVG();
  },

  resetParams: () => {
    const template = getTemplateById(get().selectedTemplateId);
    if (template) {
      set({ currentParams: { ...template.defaultParams }, isCustomCode: false });
      get().initializeTimelineFromTemplate(get().selectedTemplateId);
      get().generateSVG();
    }
  },

  setSvgCode: (code: string) => {
    set({ svgCode: code, isCustomCode: true });
  },

  setPreviewBackground: (bg: PreviewBackground) => {
    set({ previewBackground: bg });
  },

  setViewMode: (mode: ViewMode) => {
    set({ viewMode: mode });
  },

  toggleFavorite: (templateId: string, params: AnimationParams) => {
    const { favorites } = get();
    const existingIndex = favorites.findIndex(
      f => f.templateId === templateId && JSON.stringify(f.params) === JSON.stringify(params)
    );

    if (existingIndex >= 0) {
      const newFavorites = favorites.filter((_, i) => i !== existingIndex);
      set({ favorites: newFavorites });
      saveFavoritesToStorage(newFavorites);
      get().addToast('已取消收藏', 'info');
    } else {
      const template = getTemplateById(templateId);
      const customTemplate = get().getCustomTemplateById(templateId);
      const newFavorite: FavoriteItem = {
        id: `${Date.now()}-${Math.random()}`,
        templateId,
        params: { ...params },
        name: template?.name || customTemplate?.name || '自定义动画',
        createdAt: Date.now(),
      };
      const newFavorites = [...favorites, newFavorite];
      set({ favorites: newFavorites });
      saveFavoritesToStorage(newFavorites);
      get().addToast('已添加到收藏夹', 'success');
    }
  },

  removeFavorite: (id: string) => {
    const newFavorites = get().favorites.filter(f => f.id !== id);
    set({ favorites: newFavorites });
    saveFavoritesToStorage(newFavorites);
    get().addToast('已从收藏夹移除', 'info');
  },

  addToast: (message: string, type: ToastMessage['type']) => {
    const id = `${Date.now()}-${Math.random()}`;
    const toast: ToastMessage = { id, message, type };
    set({ toasts: [...get().toasts, toast] });
    setTimeout(() => {
      get().removeToast(id);
    }, 3000);
  },

  removeToast: (id: string) => {
    set({ toasts: get().toasts.filter(t => t.id !== id) });
  },

  setSelectedCategory: (category: string) => {
    set({ selectedCategory: category });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setIsCustomCode: (value: boolean) => {
    set({ isCustomCode: value });
  },

  generateSVG: () => {
    const { selectedTemplateId, currentParams, isCustomCode, timeline } = get();
    if (isCustomCode) {
      return;
    }
    if (timeline.enabled) {
      get().generateTimelineSVGCode();
      return;
    }
    const template = getTemplateById(selectedTemplateId);
    if (template) {
      set({ svgCode: template.generate(currentParams) });
    }
  },

  setTimelineEnabled: (enabled: boolean) => {
    set((state) => ({
      timeline: { ...state.timeline, enabled, currentTime: 0, isPlaying: false },
    }));
    if (enabled) {
      get().generateTimelineSVGCode();
    } else {
      get().generateSVG();
    }
  },

  setCurrentTime: (time: number) => {
    const clampedTime = Math.max(0, Math.min(get().timeline.duration, time));
    set((state) => ({
      timeline: { ...state.timeline, currentTime: clampedTime },
    }));
    if (get().timeline.enabled) {
      get().generateTimelineSVGCode();
    }
  },

  setIsPlaying: (isPlaying: boolean) => {
    set((state) => ({ timeline: { ...state.timeline, isPlaying } }));

    if (playbackIntervalId !== null) {
      clearInterval(playbackIntervalId);
      playbackIntervalId = null;
    }

    if (isPlaying) {
      const state = get();
      if (!state.timeline.enabled) return;

      playbackStartTime = performance.now();
      playbackStartPosition = state.timeline.currentTime;

      const tick = () => {
        const state = get();
        if (!state.timeline.isPlaying || !state.timeline.enabled) {
          if (playbackIntervalId !== null) {
            clearInterval(playbackIntervalId);
            playbackIntervalId = null;
          }
          return;
        }

        const now = performance.now();
        const elapsed = (now - playbackStartTime) / 1000;
        let newTime = playbackStartPosition + elapsed;

        const duration = state.timeline.duration;
        const loopCount = state.currentParams.loopCount;

        if (duration > 0) {
          if (loopCount === 0) {
            newTime = newTime % duration;
            if (newTime < 0) newTime += duration;
          } else {
            const totalDuration = duration * loopCount;
            if (newTime >= totalDuration) {
              newTime = duration;
              set((s) => ({ timeline: { ...s.timeline, isPlaying: false } }));
              if (playbackIntervalId !== null) {
                clearInterval(playbackIntervalId);
                playbackIntervalId = null;
              }
              return;
            } else if (newTime > duration) {
              newTime = newTime % duration;
            }
          }
        }

        const clampedTime = Math.max(0, Math.min(duration, newTime));
        set((s) => ({
          timeline: { ...s.timeline, currentTime: clampedTime },
        }));

        if (get().timeline.enabled) {
          get().generateTimelineSVGCode();
        }
      };

      playbackIntervalId = window.setInterval(tick, 1000 / 60);
    }
  },

  setTimelineDuration: (duration: number) => {
    set((state) => ({
      timeline: { ...state.timeline, duration: Math.max(0.1, duration) },
    }));
  },

  setTimelineZoom: (zoom: number) => {
    set((state) => ({
      timeline: { ...state.timeline, zoom: Math.max(0.5, Math.min(5, zoom)) },
    }));
  },

  selectLayer: (layerId: string | null) => {
    set((state) => ({
      timeline: {
        ...state.timeline,
        selectedLayerId: layerId,
        selectedKeyframeId: null,
      },
    }));
  },

  selectKeyframe: (layerId: string | null, keyframeId: string | null) => {
    set((state) => ({
      timeline: {
        ...state.timeline,
        selectedLayerId: layerId,
        selectedKeyframeId: keyframeId,
      },
    }));

    if (layerId && keyframeId) {
      const layer = get().timeline.layers.find((l) => l.id === layerId);
      if (layer) {
        const keyframe = layer.keyframes.find((k) => k.id === keyframeId);
        if (keyframe) {
          set((state) => ({
            timeline: { ...state.timeline, currentTime: keyframe.time },
          }));
          get().generateTimelineSVGCode();
        }
      }
    }
  },

  toggleLayerVisibility: (layerId: string) => {
    set((state) => ({
      timeline: {
        ...state.timeline,
        layers: state.timeline.layers.map((l) =>
          l.id === layerId ? { ...l, visible: !l.visible } : l
        ),
      },
    }));
    if (get().timeline.enabled) {
      get().generateTimelineSVGCode();
    }
  },

  toggleLayerLock: (layerId: string) => {
    set((state) => ({
      timeline: {
        ...state.timeline,
        layers: state.timeline.layers.map((l) =>
          l.id === layerId ? { ...l, locked: !l.locked } : l
        ),
      },
    }));
  },

  addLayer: (layer: Omit<AnimationLayer, 'id'>) => {
    const newLayer: AnimationLayer = {
      ...layer,
      id: generateId(),
      phaseOffset: layer.phaseOffset || 0,
    };
    set((state) => ({
      timeline: {
        ...state.timeline,
        layers: [...state.timeline.layers, newLayer],
        selectedLayerId: newLayer.id,
      },
    }));
  },

  removeLayer: (layerId: string) => {
    set((state) => ({
      timeline: {
        ...state.timeline,
        layers: state.timeline.layers.filter((l) => l.id !== layerId),
        selectedLayerId: state.timeline.selectedLayerId === layerId ? null : state.timeline.selectedLayerId,
        selectedKeyframeId: state.timeline.selectedLayerId === layerId ? null : state.timeline.selectedKeyframeId,
      },
    }));
    if (get().timeline.enabled) {
      get().generateTimelineSVGCode();
    }
  },

  updateLayerName: (layerId: string, name: string) => {
    set((state) => ({
      timeline: {
        ...state.timeline,
        layers: state.timeline.layers.map((l) =>
          l.id === layerId ? { ...l, name } : l
        ),
      },
    }));
  },

  updateLayerPhaseOffset: (layerId: string, offset: number) => {
    set((state) => ({
      timeline: {
        ...state.timeline,
        layers: state.timeline.layers.map((l) =>
          l.id === layerId ? { ...l, phaseOffset: offset } : l
        ),
      },
    }));
    if (get().timeline.enabled) {
      get().generateTimelineSVGCode();
    }
  },

  addKeyframe: (layerId: string, time: number, transform: Partial<TransformParams> = {}) => {
    const layer = get().timeline.layers.find((l) => l.id === layerId);
    if (!layer || layer.locked) return;

    const existingKeyframe = layer.keyframes.find((k) => Math.abs(k.time - time) < 0.01);
    if (existingKeyframe) {
      get().updateKeyframeTransform(layerId, existingKeyframe.id, transform);
      return;
    }

    const newKeyframe = createKeyframe(time, transform);
    set((state) => ({
      timeline: {
        ...state.timeline,
        layers: state.timeline.layers.map((l) =>
          l.id === layerId
            ? {
                ...l,
                keyframes: [...l.keyframes, newKeyframe].sort((a, b) => a.time - b.time),
              }
            : l
        ),
        selectedKeyframeId: newKeyframe.id,
        selectedLayerId: layerId,
      },
    }));
    if (get().timeline.enabled) {
      get().generateTimelineSVGCode();
    }
  },

  removeKeyframe: (layerId: string, keyframeId: string) => {
    const layer = get().timeline.layers.find((l) => l.id === layerId);
    if (!layer || layer.locked) return;

    set((state) => ({
      timeline: {
        ...state.timeline,
        layers: state.timeline.layers.map((l) =>
          l.id === layerId
            ? { ...l, keyframes: l.keyframes.filter((k) => k.id !== keyframeId) }
            : l
        ),
        selectedKeyframeId: state.timeline.selectedKeyframeId === keyframeId ? null : state.timeline.selectedKeyframeId,
      },
    }));
    if (get().timeline.enabled) {
      get().generateTimelineSVGCode();
    }
  },

  updateKeyframeTime: (layerId: string, keyframeId: string, time: number) => {
    const layer = get().timeline.layers.find((l) => l.id === layerId);
    if (!layer || layer.locked) return;

    const clampedTime = Math.max(0, Math.min(get().timeline.duration, time));
    set((state) => ({
      timeline: {
        ...state.timeline,
        layers: state.timeline.layers.map((l) =>
          l.id === layerId
            ? {
                ...l,
                keyframes: l.keyframes
                  .map((k) => (k.id === keyframeId ? { ...k, time: clampedTime } : k))
                  .sort((a, b) => a.time - b.time),
              }
            : l
        ),
      },
    }));
    if (get().timeline.enabled) {
      get().generateTimelineSVGCode();
    }
  },

  updateKeyframeTransform: (layerId: string, keyframeId: string, transform: Partial<TransformParams>) => {
    const layer = get().timeline.layers.find((l) => l.id === layerId);
    if (!layer || layer.locked) return;

    set((state) => ({
      timeline: {
        ...state.timeline,
        layers: state.timeline.layers.map((l) =>
          l.id === layerId
            ? {
                ...l,
                keyframes: l.keyframes.map((k) =>
                  k.id === keyframeId
                    ? { ...k, transform: { ...k.transform, ...transform } }
                    : k
                ),
              }
            : l
        ),
      },
    }));
    if (get().timeline.enabled) {
      get().generateTimelineSVGCode();
    }
  },

  updateKeyframeEasing: (layerId: string, keyframeId: string, property: keyof Keyframe['easing'], curve: BezierCurve) => {
    const layer = get().timeline.layers.find((l) => l.id === layerId);
    if (!layer || layer.locked) return;

    set((state) => ({
      timeline: {
        ...state.timeline,
        layers: state.timeline.layers.map((l) =>
          l.id === layerId
            ? {
                ...l,
                keyframes: l.keyframes.map((k) =>
                  k.id === keyframeId
                    ? {
                        ...k,
                        easing: {
                          ...k.easing,
                          [property]: curve,
                        },
                      }
                    : k
                ),
              }
            : l
        ),
      },
    }));
    if (get().timeline.enabled) {
      get().generateTimelineSVGCode();
    }
  },

  updateCurrentTransform: (transform: Partial<TransformParams>) => {
    const { timeline } = get();
    if (!timeline.selectedLayerId || !timeline.selectedKeyframeId) {
      get().addKeyframe(
        timeline.selectedLayerId || timeline.layers[0]?.id,
        timeline.currentTime,
        transform
      );
      return;
    }
    get().updateKeyframeTransform(
      timeline.selectedLayerId,
      timeline.selectedKeyframeId,
      transform
    );
  },

  duplicateKeyframe: (layerId: string, keyframeId: string, newTime: number) => {
    const layer = get().timeline.layers.find((l) => l.id === layerId);
    if (!layer || layer.locked) return;

    const keyframe = layer.keyframes.find((k) => k.id === keyframeId);
    if (!keyframe) return;

    const newKeyframe: Keyframe = {
      ...createKeyframe(newTime, keyframe.transform),
      easing: JSON.parse(JSON.stringify(keyframe.easing)),
    };

    set((state) => ({
      timeline: {
        ...state.timeline,
        layers: state.timeline.layers.map((l) =>
          l.id === layerId
            ? {
                ...l,
                keyframes: [...l.keyframes, newKeyframe].sort((a, b) => a.time - b.time),
              }
            : l
        ),
        selectedKeyframeId: newKeyframe.id,
      },
    }));
    if (get().timeline.enabled) {
      get().generateTimelineSVGCode();
    }
  },

  initializeTimelineFromTemplate: (templateId: string) => {
    const template = getTemplateById(templateId);
    if (!template) return;

    const dotCount = templateId.includes('dots-bounce') ? 3 :
                     templateId.includes('dots-pulse') ? 3 :
                     templateId.includes('dots-wave') ? 5 :
                     templateId.includes('dots-rotate') ? 8 :
                     templateId.includes('dots-grid') ? 9 :
                     templateId.includes('circular') ? 2 : 1;

    const layers: AnimationLayer[] = [];
    const duration = template.defaultParams.duration;
    const bounceHeight = duration > 0 ? Math.min(15, duration * 10) : 10;
    const pulseScale = 1.3;

    const isBounceType = templateId.includes('bounce') || templateId.includes('wave');
    const isPulseType = templateId.includes('pulse');
    const isRotateType = templateId.includes('rotate');
    const isGridType = templateId.includes('grid');
    const isCircularType = templateId.includes('circular');

    const { size } = template.defaultParams;
    const bounceY = size / 6;

    for (let i = 0; i < dotCount; i++) {
      const phaseOffset = (i / dotCount) * duration * 0.5;
      const keyframes: Keyframe[] = [];

      if (isBounceType) {
        const keyframeTimes = [0, duration * 0.5, duration];
        const yValues = [0, -bounceY, 0];

        keyframeTimes.forEach((time, idx) => {
          keyframes.push(createKeyframe(time, {
            y: yValues[idx],
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            opacity: 1,
          }));
        });
      } else if (isPulseType) {
        const keyframeTimes = [0, duration * 0.3, duration * 0.6, duration];
        const scaleValues = [1, pulseScale, 0.9, 1];
        const opacityValues = [1, 1, 0.7, 1];

        keyframeTimes.forEach((time, idx) => {
          keyframes.push(createKeyframe(time, {
            y: 0,
            scaleX: scaleValues[idx],
            scaleY: scaleValues[idx],
            rotation: 0,
            opacity: opacityValues[idx],
          }));
        });
      } else if (isRotateType) {
        keyframes.push(createKeyframe(0, {
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 0.3 + (i / dotCount) * 0.7,
        }));
        keyframes.push(createKeyframe(duration, {
          rotation: 360,
          scaleX: 1,
          scaleY: 1,
          opacity: 0.3 + (i / dotCount) * 0.7,
        }));
      } else if (isGridType) {
        const keyframeTimes = [0, duration * 0.5, duration];
        const opacityValues = [0.3, 1, 0.3];
        const scaleValues = [0.8, 1.1, 0.8];

        keyframeTimes.forEach((time, idx) => {
          keyframes.push(createKeyframe(time, {
            scaleX: scaleValues[idx],
            scaleY: scaleValues[idx],
            opacity: opacityValues[idx],
          }));
        });
      } else if (isCircularType) {
        keyframes.push(createKeyframe(0, { rotation: 0, opacity: 1 }));
        keyframes.push(createKeyframe(duration, { rotation: 360, opacity: 1 }));
      } else {
        keyframes.push(createKeyframe(0, { y: -bounceHeight * 0.5 }));
        keyframes.push(createKeyframe(duration * 0.5, { y: bounceHeight * 0.5 }));
        keyframes.push(createKeyframe(duration, { y: -bounceHeight * 0.5 }));
      }

      const layer: AnimationLayer = {
        id: generateId(),
        name: `图层 ${i + 1}`,
        elementId: `element-${i}`,
        visible: true,
        locked: false,
        keyframes,
        phaseOffset,
      };
      layers.push(layer);
    }

    set((state) => ({
      timeline: {
        ...state.timeline,
        duration,
        layers,
        selectedLayerId: layers[0]?.id || null,
        selectedKeyframeId: null,
        currentTime: 0,
        isPlaying: false,
      },
    }));
  },

  generateTimelineSVGCode: () => {
    const { timeline, currentParams } = get();
    const svgCode = generateTimelineSVG(timeline, currentParams);
    set({ svgCode });
  },

  addCustomTemplate: (template: CustomTemplate) => {
    const newTemplates = [...get().customTemplates, template];
    set({ customTemplates: newTemplates });
    saveCustomTemplatesToStorage(newTemplates);
    get().addToast('模板已保存', 'success');
  },

  updateCustomTemplate: (id: string, updates: Partial<CustomTemplate>) => {
    const newTemplates = get().customTemplates.map(t =>
      t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t
    );
    set({ customTemplates: newTemplates });
    saveCustomTemplatesToStorage(newTemplates);
    get().addToast('模板已更新', 'success');
  },

  deleteCustomTemplate: (id: string) => {
    const newTemplates = get().customTemplates.filter(t => t.id !== id);
    set({ customTemplates: newTemplates });
    saveCustomTemplatesToStorage(newTemplates);
    get().addToast('模板已删除', 'info');
  },

  loadSharedTemplate: () => {
    const sharedTemplate = getTemplateFromCurrentURL();
    if (sharedTemplate) {
      const existing = get().getCustomTemplateById(sharedTemplate.id);
      if (!existing) {
        get().addCustomTemplate(sharedTemplate);
      }
      set({
        selectedTemplateId: sharedTemplate.id,
        currentParams: { ...sharedTemplate.defaultParams },
        svgCode: sharedTemplate.svgCode,
        isCustomCode: true,
        viewMode: 'workbench',
        canvasElements: sharedTemplate.elements,
        editingTemplateId: sharedTemplate.id,
        selectedElementId: null,
      });
      get().addToast('已加载分享模板，进入编辑模式', 'success');
      window.history.replaceState({}, '', window.location.pathname);
    }
  },

  addCanvasElement: (element: CanvasElement) => {
    set({ canvasElements: [...get().canvasElements, element], selectedElementId: element.id });
    get().generateCanvasSVG();
  },

  updateCanvasElement: (id: string, updates: Partial<CanvasElement>) => {
    set({
      canvasElements: get().canvasElements.map(el =>
        el.id === id ? { ...el, ...updates } : el
      ),
    });
    get().generateCanvasSVG();
  },

  deleteCanvasElement: (id: string) => {
    set({
      canvasElements: get().canvasElements.filter(el => el.id !== id),
      selectedElementId: get().selectedElementId === id ? null : get().selectedElementId,
    });
    get().generateCanvasSVG();
  },

  setSelectedElementId: (id: string | null) => {
    set({ selectedElementId: id });
  },

  addElementAnimation: (elementId: string, animation: CanvasAnimation) => {
    set({
      canvasElements: get().canvasElements.map(el =>
        el.id === elementId
          ? { ...el, animations: [...el.animations, animation] }
          : el
      ),
    });
    get().generateCanvasSVG();
  },

  updateElementAnimation: (elementId: string, animId: string, updates: Partial<CanvasAnimation>) => {
    set({
      canvasElements: get().canvasElements.map(el =>
        el.id === elementId
          ? {
              ...el,
              animations: el.animations.map(a =>
                a.id === animId ? { ...a, ...updates } : a
              ),
            }
          : el
      ),
    });
    get().generateCanvasSVG();
  },

  deleteElementAnimation: (elementId: string, animId: string) => {
    set({
      canvasElements: get().canvasElements.map(el =>
        el.id === elementId
          ? { ...el, animations: el.animations.filter(a => a.id !== animId) }
          : el
      ),
    });
    get().generateCanvasSVG();
  },

  setCanvasElements: (elements: CanvasElement[]) => {
    set({ canvasElements: elements });
    get().generateCanvasSVG();
  },

  setEditingTemplateId: (id: string | null) => {
    set({ editingTemplateId: id });
  },

  enterWorkbench: (templateId?: string) => {
    if (templateId) {
      const customTemplate = get().getCustomTemplateById(templateId);
      if (customTemplate) {
        set({
          viewMode: 'workbench',
          canvasElements: [...customTemplate.elements],
          editingTemplateId: templateId,
          selectedElementId: null,
          svgCode: customTemplate.svgCode,
          currentParams: { ...customTemplate.defaultParams },
          isCustomCode: true,
        });
        return;
      }
    }
    set({
      viewMode: 'workbench',
      canvasElements: [],
      editingTemplateId: null,
      selectedElementId: null,
    });
    get().generateCanvasSVG();
  },

  saveWorkbenchAsTemplate: (name: string, category: string, description: string) => {
    const { canvasElements, currentParams, editingTemplateId } = get();
    const svgCode = elementsToSVG(canvasElements, currentParams.size);

    if (editingTemplateId) {
      get().updateCustomTemplate(editingTemplateId, {
        name,
        category: category as TemplateCategory,
        description,
        svgCode,
        elements: canvasElements,
        defaultParams: { ...currentParams },
      });
    } else {
      const newTemplate: CustomTemplate = {
        id: generateId(),
        name,
        category: category as TemplateCategory,
        description,
        thumbnail: '',
        svgCode,
        elements: canvasElements,
        defaultParams: { ...currentParams },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      get().addCustomTemplate(newTemplate);
      set({ editingTemplateId: newTemplate.id });
    }

    set({ svgCode });
  },

  generateCanvasSVG: () => {
    const { canvasElements, currentParams } = get();
    const svgCode = elementsToSVG(canvasElements, currentParams.size);
    set({ svgCode });
  },

  getCustomTemplateById: (id: string): CustomTemplate | undefined => {
    return get().customTemplates.find(t => t.id === id);
  },
}));

if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).useAppStore = useAppStore;
}
