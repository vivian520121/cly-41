import { AnimationParams, SVGAnimationTemplate } from '@/types';
import { getLoopValue } from '@/utils/easingFunctions';

export const pulseTemplates: SVGAnimationTemplate[] = [
  {
    id: 'pulse-ring',
    name: '脉冲环',
    category: 'pulse',
    description: '向外扩散的环形脉冲',
    defaultParams: {
      size: 48,
      duration: 1.5,
      strokeWidth: 3,
      color: '#0ea5e9',
      colorSecondary: '#e0f2fe',
      loopCount: 0,
      easing: 'ease-out',
    },
    generate: (params: AnimationParams) => {
      const { size, duration, strokeWidth, color, loopCount } = params;
      const center = size / 2;
      const maxRadius = (size - strokeWidth) / 2;
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="${center}" cy="${center}" r="${maxRadius / 3}" fill="${color}" />
  <circle cx="${center}" cy="${center}" r="${maxRadius / 3}" fill="none" stroke="${color}" stroke-width="${strokeWidth}">
    <animate attributeName="r" values="${maxRadius / 3};${maxRadius}" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" />
    <animate attributeName="opacity" values="1;0" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" />
  </circle>
  <circle cx="${center}" cy="${center}" r="${maxRadius / 3}" fill="none" stroke="${color}" stroke-width="${strokeWidth}">
    <animate attributeName="r" values="${maxRadius / 3};${maxRadius}" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" begin="${duration / 2}s" />
    <animate attributeName="opacity" values="1;0" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" begin="${duration / 2}s" />
  </circle>
</svg>`;
    },
  },
  {
    id: 'pulse-heartbeat',
    name: '心跳脉冲',
    category: 'pulse',
    description: '模拟心跳的脉冲效果',
    defaultParams: {
      size: 48,
      duration: 1,
      strokeWidth: 2,
      color: '#ef4444',
      colorSecondary: '#fee2e2',
      loopCount: 0,
      easing: 'ease-in-out',
    },
    generate: (params: AnimationParams) => {
      const { size, duration, color, loopCount } = params;
      const center = size / 2;
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <path d="M${center} ${center * 1.4} C${center * 0.4} ${center * 0.9}, ${center * 0.2} ${center * 0.4}, ${center} ${center * 0.5} C${center * 1.8} ${center * 0.4}, ${center * 1.6} ${center * 0.9}, ${center} ${center * 1.4}" fill="${color}">
    <animateTransform attributeName="transform" type="scale" values="1;1.15;1;1.15;1" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" />
  </path>
</svg>`;
    },
  },
  {
    id: 'pulse-dot',
    name: '呼吸圆点',
    category: 'pulse',
    description: '圆点呼吸式缩放',
    defaultParams: {
      size: 48,
      duration: 2,
      strokeWidth: 0,
      color: '#10b981',
      colorSecondary: '#d1fae5',
      loopCount: 0,
      easing: 'ease-in-out',
    },
    generate: (params: AnimationParams) => {
      const { size, duration, color, colorSecondary, loopCount } = params;
      const center = size / 2;
      const maxRadius = size / 3;
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="${center}" cy="${center}" r="${maxRadius}" fill="${colorSecondary}" opacity="0.3">
    <animate attributeName="r" values="${maxRadius};${maxRadius * 1.3};${maxRadius}" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" />
    <animate attributeName="opacity" values="0.3;0.1;0.3" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" />
  </circle>
  <circle cx="${center}" cy="${center}" r="${maxRadius * 0.6}" fill="${color}">
    <animate attributeName="r" values="${maxRadius * 0.6};${maxRadius * 0.8};${maxRadius * 0.6}" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" />
  </circle>
</svg>`;
    },
  },
  {
    id: 'pulse-ripple',
    name: '水波纹',
    category: 'pulse',
    description: '水波纹扩散效果',
    defaultParams: {
      size: 64,
      duration: 2,
      strokeWidth: 2,
      color: '#06b6d4',
      colorSecondary: '#cffafe',
      loopCount: 0,
      easing: 'ease-out',
    },
    generate: (params: AnimationParams) => {
      const { size, duration, strokeWidth, color, loopCount } = params;
      const center = size / 2;
      const maxRadius = (size - strokeWidth) / 2;
      const rings = [];
      for (let i = 0; i < 3; i++) {
        rings.push(`<circle cx="${center}" cy="${center}" r="0" fill="none" stroke="${color}" stroke-width="${strokeWidth}">
    <animate attributeName="r" values="0;${maxRadius}" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" begin="${i * duration / 3}s" />
    <animate attributeName="opacity" values="1;0" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" begin="${i * duration / 3}s" />
  </circle>`);
      }
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
${rings.join('\n')}
</svg>`;
    },
  },
];
