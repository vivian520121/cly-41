import { AnimationParams, SVGAnimationTemplate } from '@/types';
import { getLoopValue } from '@/utils/easingFunctions';

export const glitchTemplates: SVGAnimationTemplate[] = [
  {
    id: 'glitch-text',
    name: '故障文字',
    category: 'glitch',
    description: '故障风格的LOADING文字',
    defaultParams: {
      size: 120,
      duration: 0.5,
      strokeWidth: 1,
      color: '#0ea5e9',
      colorSecondary: '#ef4444',
      loopCount: 0,
      easing: 'steps(2)',
    },
    generate: (params: AnimationParams) => {
      const { size, duration, color, colorSecondary, loopCount } = params;
      const fontSize = size / 5;
      return `<svg width="${size}" height="${size / 2}" viewBox="0 0 ${size} ${size / 2}" xmlns="http://www.w3.org/2000/svg">
  <text x="${size / 2}" y="${size / 3.5}" text-anchor="middle" font-size="${fontSize}" font-weight="bold" font-family="monospace" fill="${color}">
    LOADING
    <animate attributeName="x" values="${size / 2};${size / 2 + 3};${size / 2 - 3};${size / 2}" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" />
  </text>
  <text x="${size / 2}" y="${size / 3.5}" text-anchor="middle" font-size="${fontSize}" font-weight="bold" font-family="monospace" fill="${colorSecondary}" opacity="0.5">
    LOADING
    <animate attributeName="x" values="${size / 2};${size / 2 - 3};${size / 2 + 3};${size / 2}" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" />
  </text>
  <rect x="0" y="${size / 8}" width="${size}" height="3" fill="${color}" opacity="0.7">
    <animate attributeName="x" values="-100%;0;100%" dur="${duration * 2}s" repeatCount="${getLoopValue(loopCount)}" />
  </rect>
</svg>`;
    },
  },
  {
    id: 'glitch-square',
    name: '故障方块',
    category: 'glitch',
    description: '故障风格的方块旋转',
    defaultParams: {
      size: 48,
      duration: 0.8,
      strokeWidth: 2,
      color: '#8b5cf6',
      colorSecondary: '#ec4899',
      loopCount: 0,
      easing: 'steps(4)',
    },
    generate: (params: AnimationParams) => {
      const { size, duration, color, colorSecondary, strokeWidth, loopCount } = params;
      const center = size / 2;
      const rectSize = size / 2;
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect x="${center - rectSize / 2}" y="${center - rectSize / 2}" width="${rectSize}" height="${rectSize}" fill="none" stroke="${color}" stroke-width="${strokeWidth}">
    <animateTransform attributeName="transform" type="rotate" values="0 ${center} ${center};90 ${center} ${center};180 ${center} ${center};270 ${center} ${center};360 ${center} ${center}" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" />
    <animate attributeName="x" values="${center - rectSize / 2};${center - rectSize / 2 + 2};${center - rectSize / 2 - 2};${center - rectSize / 2}" dur="${duration / 2}s" repeatCount="${getLoopValue(loopCount)}" />
  </rect>
  <rect x="${center - rectSize / 2}" y="${center - rectSize / 2}" width="${rectSize}" height="${rectSize}" fill="none" stroke="${colorSecondary}" stroke-width="${strokeWidth}" opacity="0.6">
    <animateTransform attributeName="transform" type="rotate" values="360 ${center} ${center};270 ${center} ${center};180 ${center} ${center};90 ${center} ${center};0 ${center} ${center}" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" />
    <animate attributeName="x" values="${center - rectSize / 2};${center - rectSize / 2 - 2};${center - rectSize / 2 + 2};${center - rectSize / 2}" dur="${duration / 2}s" repeatCount="${getLoopValue(loopCount)}" />
  </rect>
</svg>`;
    },
  },
  {
    id: 'glitch-bars',
    name: '故障条纹',
    category: 'glitch',
    description: '故障风格的条纹效果',
    defaultParams: {
      size: 48,
      duration: 0.6,
      strokeWidth: 0,
      color: '#0ea5e9',
      colorSecondary: '#ef4444',
      loopCount: 0,
      easing: 'steps(3)',
    },
    generate: (params: AnimationParams) => {
      const { size, duration, color, colorSecondary, loopCount } = params;
      const barWidth = size / 6;
      const bars = [];
      for (let i = 0; i < 6; i++) {
        const height = size * (0.3 + Math.random() * 0.7);
        bars.push(`<rect x="${i * barWidth}" y="${(size - height) / 2}" width="${barWidth - 2}" height="${height}" fill="${i % 2 === 0 ? color : colorSecondary}">
    <animate attributeName="height" values="${height};${height * 0.3};${height * 1.2};${height}" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" begin="${i * 0.05}s" />
    <animate attributeName="y" values="${(size - height) / 2};${size - height * 0.3};${(size - height * 1.2) / 2};${(size - height) / 2}" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" begin="${i * 0.05}s" />
  </rect>`);
      }
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
${bars.join('\n')}
</svg>`;
    },
  },
];
