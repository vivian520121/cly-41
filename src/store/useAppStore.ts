import { create } from 'zustand';
import { AnimationParams, SVGAnimationTemplate, FavoriteItem, PreviewBackground, ViewMode, ToastMessage } from '@/types';
import { allTemplates, getTemplateById } from '@/templates';

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

  selectTemplate: (templateId: string) => {
    const template = getTemplateById(templateId);
    if (template) {
      set({
        selectedTemplateId: templateId,
        currentParams: { ...template.defaultParams },
        isCustomCode: false,
      });
      get().generateSVG();
    }
  },

  updateParams: (params: Partial<AnimationParams>) => {
    const newParams = { ...get().currentParams, ...params };
    set({ currentParams: newParams, isCustomCode: false });
    get().generateSVG();
  },

  resetParams: () => {
    const template = getTemplateById(get().selectedTemplateId);
    if (template) {
      set({ currentParams: { ...template.defaultParams }, isCustomCode: false });
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
    const { selectedTemplateId, currentParams, isCustomCode, svgCode } = get();
    if (isCustomCode) {
      return;
    }
    const template = getTemplateById(selectedTemplateId);
    if (template) {
      set({ svgCode: template.generate(currentParams) });
    }
  },
}));
