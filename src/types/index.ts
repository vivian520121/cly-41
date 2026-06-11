export type TemplateCategory = 'circular' | 'dots' | 'pulse' | 'glitch' | 'pixel' | 'bars' | 'custom' | 'other';

export interface TransformParams {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  opacity: number;
}

export interface AnimationParams {
  size: number;
  duration: number;
  strokeWidth: number;
  color: string;
  colorSecondary: string;
  loopCount: number;
  easing: string;
}

export interface Keyframe {
  id: string;
  time: number;
  transform: TransformParams;
  easing: {
    x: BezierCurve;
    y: BezierCurve;
    scaleX: BezierCurve;
    scaleY: BezierCurve;
    rotation: BezierCurve;
    opacity: BezierCurve;
  };
}

export interface BezierCurve {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface AnimationLayer {
  id: string;
  name: string;
  elementId: string;
  visible: boolean;
  locked: boolean;
  keyframes: Keyframe[];
  phaseOffset: number;
}

export interface TimelineState {
  enabled: boolean;
  currentTime: number;
  isPlaying: boolean;
  duration: number;
  zoom: number;
  selectedLayerId: string | null;
  selectedKeyframeId: string | null;
  layers: AnimationLayer[];
}

export const defaultTransformParams: TransformParams = {
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
  opacity: 1,
};

export const defaultBezierCurve: BezierCurve = {
  x1: 0.42,
  y1: 0,
  x2: 0.58,
  y2: 1,
};

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

export type ViewMode = 'templates' | 'favorites' | 'workbench';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type CanvasShapeType = 'circle' | 'rect' | 'line' | 'path';

export interface CanvasElement {
  id: string;
  type: CanvasShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  rotation: number;
  rx: number;
  ry: number;
  pathData: string;
  animations: CanvasAnimation[];
}

export interface CanvasAnimation {
  id: string;
  attributeName: string;
  values: string;
  dur: string;
  repeatCount: string;
  begin: string;
  fill: string;
  calcMode: string;
  keyTimes: string;
  keySplines: string;
}

export interface CustomTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  thumbnail: string;
  svgCode: string;
  elements: CanvasElement[];
  defaultParams: AnimationParams;
  createdAt: number;
  updatedAt: number;
}
