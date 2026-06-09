import { AnimationParams, SVGAnimationTemplate } from '@/types';
import { getLoopValue } from '@/utils/easingFunctions';

export const circularTemplates: SVGAnimationTemplate[] = [
  {
    id: 'circular-spinner',
    name: '经典环形',
    category: 'circular',
    description: '经典的旋转加载动画',
    defaultParams: {
      size: 48,
      duration: 1,
      strokeWidth: 4,
      color: '#0ea5e9',
      colorSecondary: '#e2e8f0',
      loopCount: 0,
      easing: 'linear',
    },
    generate: (params: AnimationParams) => {
      const { size, duration, strokeWidth, color, colorSecondary, loopCount } = params;
      const radius = (size - strokeWidth) / 2;
      const circumference = 2 * Math.PI * radius;
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <circle
    cx="${size / 2}"
    cy="${size / 2}"
    r="${radius}"
    fill="none"
    stroke="${colorSecondary}"
    stroke-width="${strokeWidth}"
  />
  <circle
    cx="${size / 2}"
    cy="${size / 2}"
    r="${radius}"
    fill="none"
    stroke="${color}"
    stroke-width="${strokeWidth}"
    stroke-linecap="round"
    stroke-dasharray="${circumference * 0.75} ${circumference}"
    stroke-dashoffset="0"
  >
    <animateTransform
      attributeName="transform"
      type="rotate"
      from="0 ${size / 2} ${size / 2}"
      to="360 ${size / 2} ${size / 2}"
      dur="${duration}s"
      repeatCount="${getLoopValue(loopCount)}"
    />
  </circle>
</svg>`;
    },
  },
  {
    id: 'circular-dual-ring',
    name: '双环旋转',
    category: 'circular',
    description: '两个反向旋转的环形动画',
    defaultParams: {
      size: 48,
      duration: 1.5,
      strokeWidth: 3,
      color: '#8b5cf6',
      colorSecondary: '#0ea5e9',
      loopCount: 0,
      easing: 'linear',
    },
    generate: (params: AnimationParams) => {
      const { size, duration, strokeWidth, color, colorSecondary, loopCount } = params;
      const radius1 = (size - strokeWidth) / 2;
      const radius2 = radius1 - strokeWidth - 4;
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <circle
    cx="${size / 2}"
    cy="${size / 2}"
    r="${radius1}"
    fill="none"
    stroke="${color}"
    stroke-width="${strokeWidth}"
    stroke-linecap="round"
    stroke-dasharray="${2 * Math.PI * radius1 * 0.6} ${2 * Math.PI * radius1}"
  >
    <animateTransform
      attributeName="transform"
      type="rotate"
      from="0 ${size / 2} ${size / 2}"
      to="360 ${size / 2} ${size / 2}"
      dur="${duration}s"
      repeatCount="${getLoopValue(loopCount)}"
    />
  </circle>
  <circle
    cx="${size / 2}"
    cy="${size / 2}"
    r="${radius2}"
    fill="none"
    stroke="${colorSecondary}"
    stroke-width="${strokeWidth}"
    stroke-linecap="round"
    stroke-dasharray="${2 * Math.PI * radius2 * 0.5} ${2 * Math.PI * radius2}"
  >
    <animateTransform
      attributeName="transform"
      type="rotate"
      from="360 ${size / 2} ${size / 2}"
      to="0 ${size / 2} ${size / 2}"
      dur="${duration * 0.8}s"
      repeatCount="${getLoopValue(loopCount)}"
    />
  </circle>
</svg>`;
    },
  },
  {
    id: 'circular-dashed',
    name: '虚线环形',
    category: 'circular',
    description: '虚线样式的旋转环形',
    defaultParams: {
      size: 48,
      duration: 1.2,
      strokeWidth: 3,
      color: '#10b981',
      colorSecondary: '#d1fae5',
      loopCount: 0,
      easing: 'ease-in-out',
    },
    generate: (params: AnimationParams) => {
      const { size, duration, strokeWidth, color, colorSecondary, loopCount } = params;
      const radius = (size - strokeWidth) / 2;
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <circle
    cx="${size / 2}"
    cy="${size / 2}"
    r="${radius}"
    fill="none"
    stroke="${colorSecondary}"
    stroke-width="${strokeWidth}"
    stroke-dasharray="4 4"
  />
  <circle
    cx="${size / 2}"
    cy="${size / 2}"
    r="${radius}"
    fill="none"
    stroke="${color}"
    stroke-width="${strokeWidth}"
    stroke-linecap="round"
    stroke-dasharray="20 10 5 10"
  >
    <animateTransform
      attributeName="transform"
      type="rotate"
      from="0 ${size / 2} ${size / 2}"
      to="360 ${size / 2} ${size / 2}"
      dur="${duration}s"
      repeatCount="${getLoopValue(loopCount)}"
    />
  </circle>
</svg>`;
    },
  },
  {
    id: 'circular-progress',
    name: '进度环形',
    category: 'circular',
    description: '模拟进度加载的环形动画',
    defaultParams: {
      size: 56,
      duration: 2,
      strokeWidth: 4,
      color: '#f59e0b',
      colorSecondary: '#fef3c7',
      loopCount: 0,
      easing: 'ease-in-out',
    },
    generate: (params: AnimationParams) => {
      const { size, duration, strokeWidth, color, colorSecondary, loopCount } = params;
      const radius = (size - strokeWidth) / 2;
      const circumference = 2 * Math.PI * radius;
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <circle
    cx="${size / 2}"
    cy="${size / 2}"
    r="${radius}"
    fill="none"
    stroke="${colorSecondary}"
    stroke-width="${strokeWidth}"
  />
  <circle
    cx="${size / 2}"
    cy="${size / 2}"
    r="${radius}"
    fill="none"
    stroke="${color}"
    stroke-width="${strokeWidth}"
    stroke-linecap="round"
    stroke-dasharray="${circumference}"
    stroke-dashoffset="${circumference}"
    transform="rotate(-90 ${size / 2} ${size / 2})"
  >
    <animate
      attributeName="stroke-dashoffset"
      values="${circumference};0;${circumference}"
      dur="${duration}s"
      repeatCount="${getLoopValue(loopCount)}"
    />
  </circle>
</svg>`;
    },
  },
  {
    id: 'circular-orbit',
    name: '轨道球',
    category: 'circular',
    description: '小球沿轨道旋转',
    defaultParams: {
      size: 48,
      duration: 1.2,
      strokeWidth: 2,
      color: '#ec4899',
      colorSecondary: '#fce7f3',
      loopCount: 0,
      easing: 'linear',
    },
    generate: (params: AnimationParams) => {
      const { size, duration, strokeWidth, color, colorSecondary, loopCount } = params;
      const radius = (size - strokeWidth) / 2;
      const ballRadius = strokeWidth + 2;
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <circle
    cx="${size / 2}"
    cy="${size / 2}"
    r="${radius}"
    fill="none"
    stroke="${colorSecondary}"
    stroke-width="${strokeWidth}"
  />
  <g>
    <circle
      cx="${size / 2 + radius}"
      cy="${size / 2}"
      r="${ballRadius}"
      fill="${color}"
    />
    <animateTransform
      attributeName="transform"
      type="rotate"
      from="0 ${size / 2} ${size / 2}"
      to="360 ${size / 2} ${size / 2}"
      dur="${duration}s"
      repeatCount="${getLoopValue(loopCount)}"
    />
  </g>
</svg>`;
    },
  },
];
