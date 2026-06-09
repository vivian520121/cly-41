import { SVGAnimationTemplate } from '@/types';
import { circularTemplates } from './circular';
import { dotsTemplates } from './dots';
import { pulseTemplates } from './pulse';
import { glitchTemplates } from './glitch';
import { pixelTemplates, barsTemplates } from './pixel';

export const allTemplates: SVGAnimationTemplate[] = [
  ...circularTemplates,
  ...dotsTemplates,
  ...pulseTemplates,
  ...glitchTemplates,
  ...pixelTemplates,
  ...barsTemplates,
];

export const categoryNames: Record<string, string> = {
  circular: '环形',
  dots: '点阵',
  pulse: '脉冲',
  glitch: '故障风',
  pixel: '像素方块',
  bars: '条形',
  other: '其他',
};

export const getTemplateById = (id: string): SVGAnimationTemplate | undefined => {
  return allTemplates.find(t => t.id === id);
};

export const getTemplatesByCategory = (category: string): SVGAnimationTemplate[] => {
  return allTemplates.filter(t => t.category === category);
};
