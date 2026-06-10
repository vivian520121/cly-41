import { create } from 'zustand';
import {
  AnimationParams,
  SVGAnimationTemplate,
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
} from '@/types';
import { allTemplates, getTemplateById } from '@/templates';
import { generateTimelineSVG } from '@/utils/timelineRenderer';

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
  addKeyframe: (layerId: string, time: number, transform?: Partial<TransformParams>) => void;
  removeKeyframe: (layerId: string, keyframeId: string) => void;
  updateKeyframeTime: (layerId: string, keyframeId: string, time: number) => void;
  updateKeyframeTransform: (layerId: string, keyframeId: string, transform: Partial<TransformParams>) => void;
  updateKeyframeEasing: (layerId: string, keyframeId: string, property: keyof Keyframe['easing'], curve: BezierCurve) => void;
  updateCurrentTransform: (transform: Partial<TransformParams>) => void;
  duplicateKeyframe: (layerId: string, keyframeId: string, newTime: number) => void;
  initializeTimelineFromTemplate: (templateId: string) => void;
  generateTimelineSVGCode: () => void;
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
      const newFavorite: FavoriteItem = {
        id: `${Date.now()}-${Math.random()}`,
        templateId,
        params: { ...params },
        name: template?.name || '自定义动画',
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

    for (let i = 0; i < dotCount; i++) {
      const layer: AnimationLayer = {
        id: generateId(),
        name: `图层 ${i + 1}`,
        elementId: `element-${i}`,
        visible: true,
        locked: false,
        keyframes: [
          createKeyframe(0, {
            y: templateId.includes('bounce') || templateId.includes('wave') ? (i % 2 === 0 ? -10 : 10) : 0,
            scaleX: templateId.includes('pulse') ? 0.8 : 1,
            scaleY: templateId.includes('pulse') ? 0.8 : 1,
            rotation: templateId.includes('rotate') ? (i * 45) : 0,
            opacity: 1,
          }),
          createKeyframe(duration / 2, {
            y: templateId.includes('bounce') || templateId.includes('wave') ? (i % 2 === 0 ? 10 : -10) : 0,
            scaleX: templateId.includes('pulse') ? 1.2 : 1,
            scaleY: templateId.includes('pulse') ? 1.2 : 1,
            rotation: templateId.includes('rotate') ? (i * 45 + 180) : 0,
            opacity: 0.7,
          }),
          createKeyframe(duration, {
            y: 0,
            scaleX: 1,
            scaleY: 1,
            rotation: templateId.includes('rotate') ? (i * 45 + 360) : 0,
            opacity: 1,
          }),
        ],
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
}));

if (typeof window !== 'undefined') {
  (window as any).useAppStore = useAppStore;
}
