import { AnimationParams, SVGAnimationTemplate } from '@/types';
import { getLoopValue } from '@/utils/easingFunctions';

export const dotsTemplates: SVGAnimationTemplate[] = [
  {
    id: 'dots-bounce',
    name: '弹跳圆点',
    category: 'dots',
    description: '三个圆点依次弹跳',
    defaultParams: {
      size: 48,
      duration: 1.4,
      strokeWidth: 0,
      color: '#0ea5e9',
      colorSecondary: '#8b5cf6',
      loopCount: 0,
      easing: 'ease-in-out',
    },
    generate: (params: AnimationParams) => {
      const { size, duration, color, loopCount } = params;
      const dotSize = size / 6;
      const spacing = size / 4;
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="${size / 2 - spacing}" cy="${size / 2}" r="${dotSize}" fill="${color}">
    <animate attributeName="cy" values="${size / 2};${size / 3};${size / 2}" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" begin="0s" />
  </circle>
  <circle cx="${size / 2}" cy="${size / 2}" r="${dotSize}" fill="${color}">
    <animate attributeName="cy" values="${size / 2};${size / 3};${size / 2}" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" begin="${duration / 6}s" />
  </circle>
  <circle cx="${size / 2 + spacing}" cy="${size / 2}" r="${dotSize}" fill="${color}">
    <animate attributeName="cy" values="${size / 2};${size / 3};${size / 2}" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" begin="${duration / 3}s" />
  </circle>
</svg>`;
    },
  },
  {
    id: 'dots-pulse',
    name: '脉冲圆点',
    category: 'dots',
    description: '圆点依次脉冲放大',
    defaultParams: {
      size: 48,
      duration: 1.2,
      strokeWidth: 0,
      color: '#10b981',
      colorSecondary: '#d1fae5',
      loopCount: 0,
      easing: 'ease-in-out',
    },
    generate: (params: AnimationParams) => {
      const { size, duration, color, colorSecondary, loopCount } = params;
      const dotSize = size / 7;
      const spacing = size / 5;
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="${size / 2 - spacing}" cy="${size / 2}" r="${dotSize}" fill="${colorSecondary}">
    <animate attributeName="r" values="${dotSize};${dotSize * 1.4};${dotSize}" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" begin="0s" />
    <animate attributeName="fill" values="${colorSecondary};${color};${colorSecondary}" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" begin="0s" />
  </circle>
  <circle cx="${size / 2}" cy="${size / 2}" r="${dotSize}" fill="${colorSecondary}">
    <animate attributeName="r" values="${dotSize};${dotSize * 1.4};${dotSize}" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" begin="${duration / 4}s" />
    <animate attributeName="fill" values="${colorSecondary};${color};${colorSecondary}" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" begin="${duration / 4}s" />
  </circle>
  <circle cx="${size / 2 + spacing}" cy="${size / 2}" r="${dotSize}" fill="${colorSecondary}">
    <animate attributeName="r" values="${dotSize};${dotSize * 1.4};${dotSize}" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" begin="${duration / 2}s" />
    <animate attributeName="fill" values="${colorSecondary};${color};${colorSecondary}" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" begin="${duration / 2}s" />
  </circle>
</svg>`;
    },
  },
  {
    id: 'dots-wave',
    name: '波浪圆点',
    category: 'dots',
    description: '圆点形成波浪效果',
    defaultParams: {
      size: 64,
      duration: 1,
      strokeWidth: 0,
      color: '#f59e0b',
      colorSecondary: '#fef3c7',
      loopCount: 0,
      easing: 'ease-in-out',
    },
    generate: (params: AnimationParams) => {
      const { size, duration, color, loopCount } = params;
      const dotSize = size / 10;
      const spacing = size / 6;
      const dots = [];
      for (let i = 0; i < 5; i++) {
        dots.push(`<circle cx="${spacing + i * spacing}" cy="${size / 2}" r="${dotSize}" fill="${color}">
    <animate attributeName="cy" values="${size / 2};${size / 3};${size / 2};${size * 2 / 3};${size / 2}" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" begin="${i * duration / 8}s" />
  </circle>`);
      }
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
${dots.join('\n')}
</svg>`;
    },
  },
  {
    id: 'dots-rotate',
    name: '旋转点阵',
    category: 'dots',
    description: '圆点沿圆周旋转',
    defaultParams: {
      size: 48,
      duration: 1.5,
      strokeWidth: 0,
      color: '#ec4899',
      colorSecondary: '#fce7f3',
      loopCount: 0,
      easing: 'linear',
    },
    generate: (params: AnimationParams) => {
      const { size, duration, color, loopCount } = params;
      const center = size / 2;
      const radius = size / 3;
      const dotSize = size / 12;
      const dots = [];
      for (let i = 0; i < 8; i++) {
        const angle = (i * 45 * Math.PI) / 180;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        dots.push(`<circle cx="${x}" cy="${y}" r="${dotSize}" fill="${color}" opacity="${0.3 + i * 0.1}" />`);
      }
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <g>
    ${dots.join('\n    ')}
    <animateTransform attributeName="transform" type="rotate" from="0 ${center} ${center}" to="360 ${center} ${center}" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" />
  </g>
</svg>`;
    },
  },
  {
    id: 'dots-grid',
    name: '网格点阵',
    category: 'dots',
    description: '网格状点阵依次点亮',
    defaultParams: {
      size: 48,
      duration: 1.8,
      strokeWidth: 0,
      color: '#8b5cf6',
      colorSecondary: '#ede9fe',
      loopCount: 0,
      easing: 'ease-in-out',
    },
    generate: (params: AnimationParams) => {
      const { size, duration, color, colorSecondary, loopCount } = params;
      const dotSize = size / 12;
      const spacing = size / 4;
      const dots = [];
      let index = 0;
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const x = spacing + col * spacing;
          const y = spacing + row * spacing;
          dots.push(`<circle cx="${x}" cy="${y}" r="${dotSize}" fill="${colorSecondary}">
    <animate attributeName="fill" values="${colorSecondary};${color};${colorSecondary}" dur="${duration}s" repeatCount="${getLoopValue(loopCount)}" begin="${index * 0.1}s" />
  </circle>`);
          index++;
        }
      }
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
${dots.join('\n')}
</svg>`;
    },
  },
];
