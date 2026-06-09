export type TemplateCategory = 'circular' | 'dots' | 'pulse' | 'glitch' | 'pixel' | 'bars' | 'other';

export interface AnimationParams {
  size: number;
  duration: number;
  strokeWidth: number;
  color: string;
  colorSecondary: string;
  loopCount: number;
  easing: string;
}

export interface SVGAnimationTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  defaultParams: AnimationParams;
  generate: (params: AnimationParams) => string;
}

export interface FavoriteItem {
  id: string;
  templateId: string;
  params: AnimationParams;
  name: string;
  createdAt: number;
}

export type PreviewBackground = 'dark' | 'light' | 'checkerboard';

export type ViewMode = 'templates' | 'favorites';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
