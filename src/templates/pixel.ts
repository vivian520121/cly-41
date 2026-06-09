import { AnimationParams, SVGAnimationTemplate } from '@/types';
import { getLoopValue } from '@/utils/easingFunctions';

export const pixelTemplates: SVGAnimationTemplate[] = [
  {
    id: 'pixel-square',
    name: '像素方块',
    category: 'pixel',
    description: '像素风格的方块旋转',
    defaultParams: {
      size: 48,
      duration: 1,
      strokeWidth: 0,
      color: '#8b5cf6',
      colorSecondary: '#ede9fe',
      loopCount: 0,
      easing: 'ease-in-out',
    },
    generate: (params: AnimationParams) => {
      const { size, duration, color, loopCount } = params;
      const center = size / 2;
      const pixelSize = size / 8;
      const squares = [];
      const positions = [
        [0, 0], [1, 0], [2, 0], [3, 0],
        [0, 1], [3, 1],
        [0, 2], [3, 2],
        [0, 3], [1, 3], [2, 3], [3, 3],
      ];
      positions.forEach(([x, y], i) => {
        squares.push(`<rect x="${size / 4 + x * pixelSize}" y="${size / 4 + y * pixelSize}" width="${pixelSize - 1}" height="${pixelSize - 1}" fill="${color}" opacity="${0.3 + (i % 4) * 0.2}">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" begin="${i * 0.05}s" />
        </rect>`);
      });
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <g>
    ${squares.join('\n    ')}
    <animateTransform attributeName="transform" type="rotate" from="0 ${center} ${center}" to="360 ${center} ${center}" dur="${duration * 2}s" repeatCount="${getLoopValue(loopCount)}" />
  </g>
</svg>`;
    },
  },
  {
    id: 'pixel-loader',
    name: '像素加载条',
    category: 'pixel',
    description: '像素风格的进度加载条',
    defaultParams: {
      size: 64,
      duration: 1.5,
      strokeWidth: 0,
      color: '#10b981',
      colorSecondary: '#d1fae5',
      loopCount: 0,
      easing: 'steps(8)',
    },
    generate: (params: AnimationParams) => {
      const { size, duration, color, colorSecondary, loopCount } = params;
      const pixelSize = size / 12;
      const pixels = [];
      for (let i = 0; i < 8; i++) {
        pixels.push(`<rect x="${pixelSize + i * pixelSize * 1.2}" y="${size / 2 - pixelSize / 2}" width="${pixelSize}" height="${pixelSize}" fill="${colorSecondary}">
    <animate attributeName="fill" values="${colorSecondary};${color};${colorSecondary}" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" begin="${i * duration / 10}s" />
  </rect>`);
      }
      return `<svg width="${size}" height="${size / 3}" viewBox="0 0 ${size} ${size / 3}" xmlns="http://www.w3.org/2000/svg">
${pixels.join('\n')}
</svg>`;
    },
  },
  {
    id: 'pixel-spinner',
    name: '像素旋转',
    category: 'pixel',
    description: '8-bit风格旋转加载',
    defaultParams: {
      size: 48,
      duration: 1.2,
      strokeWidth: 0,
      color: '#f59e0b',
      colorSecondary: '#fef3c7',
      loopCount: 0,
      easing: 'steps(8)',
    },
    generate: (params: AnimationParams) => {
      const { size, duration, color, loopCount } = params;
      const center = size / 2;
      const pixelSize = size / 10;
      const pixels = [];
      const radius = size / 3;
      for (let i = 0; i < 8; i++) {
        const angle = (i * 45 * Math.PI) / 180;
        const x = center + radius * Math.cos(angle) - pixelSize / 2;
        const y = center + radius * Math.sin(angle) - pixelSize / 2;
        pixels.push(`<rect x="${x}" y="${y}" width="${pixelSize}" height="${pixelSize}" fill="${color}" opacity="${0.3 + i * 0.1}" />`);
      }
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <g>
    ${pixels.join('\n    ')}
    <animateTransform attributeName="transform" type="rotate" from="0 ${center} ${center}" to="360 ${center} ${center}" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" />
  </g>
</svg>`;
    },
  },
  {
    id: 'pixel-bounce',
    name: '像素弹跳',
    category: 'pixel',
    description: '像素方块依次弹跳',
    defaultParams: {
      size: 48,
      duration: 0.8,
      strokeWidth: 0,
      color: '#ef4444',
      colorSecondary: '#fee2e2',
      loopCount: 0,
      easing: 'ease-out',
    },
    generate: (params: AnimationParams) => {
      const { size, duration, color, loopCount } = params;
      const pixelSize = size / 6;
      const spacing = size / 4;
      const pixels = [];
      for (let i = 0; i < 3; i++) {
        pixels.push(`<rect x="${spacing + i * spacing - pixelSize / 2}" y="${size / 2}" width="${pixelSize}" height="${pixelSize}" fill="${color}">
    <animate attributeName="y" values="${size / 2};${size / 4};${size / 2}" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" begin="${i * duration / 4}s" />
  </rect>`);
      }
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
${pixels.join('\n')}
</svg>`;
    },
  },
];

export const barsTemplates: SVGAnimationTemplate[] = [
  {
    id: 'bars-wave',
    name: '波形条',
    category: 'bars',
    description: '音频波形风格的条形动画',
    defaultParams: {
      size: 48,
      duration: 1,
      strokeWidth: 0,
      color: '#0ea5e9',
      colorSecondary: '#e0f2fe',
      loopCount: 0,
      easing: 'ease-in-out',
    },
    generate: (params: AnimationParams) => {
      const { size, duration, color, loopCount } = params;
      const barWidth = size / 8;
      const bars = [];
      for (let i = 0; i < 5; i++) {
        const baseHeight = size / 4;
        bars.push(`<rect x="${size / 6 + i * barWidth * 1.2}" y="${size / 2}" width="${barWidth}" height="${baseHeight}" fill="${color}">
    <animate attributeName="height" values="${baseHeight};${size * 0.7};${baseHeight};${size * 0.5};${baseHeight}" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" begin="${i * 0.1}s" />
    <animate attributeName="y" values="${size / 2};${size / 2 - size * 0.2};${size / 2};${size / 2 - size * 0.1};${size / 2}" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" begin="${i * 0.1}s" />
  </rect>`);
      }
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
${bars.join('\n')}
</svg>`;
    },
  },
  {
    id: 'bars-grow',
    name: '生长条',
    category: 'bars',
    description: '条形依次生长',
    defaultParams: {
      size: 48,
      duration: 1.2,
      strokeWidth: 0,
      color: '#8b5cf6',
      colorSecondary: '#ede9fe',
      loopCount: 0,
      easing: 'ease-out',
    },
    generate: (params: AnimationParams) => {
      const { size, duration, color, colorSecondary, loopCount } = params;
      const barWidth = size / 7;
      const bars = [];
      for (let i = 0; i < 4; i++) {
        bars.push(`<rect x="${size / 10 + i * barWidth * 1.3}" y="${size / 6}" width="${barWidth}" height="0" fill="${i % 2 === 0 ? color : colorSecondary}">
    <animate attributeName="height" values="0;${size * 0.6};0" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" begin="${i * duration / 6}s" />
  </rect>`);
      }
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
${bars.join('\n')}
</svg>`;
    },
  },
  {
    id: 'bars-progress',
    name: '进度条',
    category: 'bars',
    description: '循环进度条动画',
    defaultParams: {
      size: 64,
      duration: 2,
      strokeWidth: 0,
      color: '#10b981',
      colorSecondary: '#d1fae5',
      loopCount: 0,
      easing: 'ease-in-out',
    },
    generate: (params: AnimationParams) => {
      const { size, duration, color, colorSecondary, loopCount } = params;
      const barHeight = size / 6;
      return `<svg width="${size}" height="${size / 4}" viewBox="0 0 ${size} ${size / 4}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="${size / 12}" width="${size}" height="${barHeight}" fill="${colorSecondary}" rx="${barHeight / 2}" />
  <rect x="0" y="${size / 12}" width="0" height="${barHeight}" fill="${color}" rx="${barHeight / 2}">
    <animate attributeName="width" values="0;${size};0" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" />
  </rect>
</svg>`;
    },
  },
];
