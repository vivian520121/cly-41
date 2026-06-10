import { TimelineState, AnimationParams, Keyframe, BezierCurve, TransformParams } from '@/types';
import { getLoopValue } from './easingFunctions';

const cubicBezier = (t: number, p0: number, p1: number, p2: number, p3: number): number => {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
};

const bezierToFunction = (curve: BezierCurve) => {
  return (t: number): number => {
    let low = 0;
    let high = 1;
    let mid = 0;

    for (let i = 0; i < 10; i++) {
      mid = (low + high) / 2;
      const x = cubicBezier(mid, 0, curve.x1, curve.x2, 1);
      if (x < t) {
        low = mid;
      } else {
        high = mid;
      }
    }

    return cubicBezier(mid, 0, curve.y1, curve.y2, 1);
  };
};

const findNearestKeyframes = (keyframes: Keyframe[], time: number) => {
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);

  if (sorted.length === 0) {
    return null;
  }

  if (time <= sorted[0].time) {
    return { prev: sorted[0], next: sorted[0], progress: 0 };
  }

  if (time >= sorted[sorted.length - 1].time) {
    return { prev: sorted[sorted.length - 1], next: sorted[sorted.length - 1], progress: 1 };
  }

  for (let i = 0; i < sorted.length - 1; i++) {
    if (time >= sorted[i].time && time <= sorted[i + 1].time) {
      const duration = sorted[i + 1].time - sorted[i].time;
      const progress = duration > 0 ? (time - sorted[i].time) / duration : 0;
      return { prev: sorted[i], next: sorted[i + 1], progress };
    }
  }

  return null;
};

const interpolateValue = (
  prev: number,
  next: number,
  progress: number,
  easing: BezierCurve
): number => {
  const easedProgress = bezierToFunction(easing)(progress);
  return prev + (next - prev) * easedProgress;
};

export const interpolateTransform = (
  keyframes: Keyframe[],
  time: number
): TransformParams => {
  const nearest = findNearestKeyframes(keyframes, time);

  if (!nearest) {
    return { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1 };
  }

  const { prev, next, progress } = nearest;

  if (prev.id === next.id || progress === 0) {
    return { ...prev.transform };
  }

  if (progress === 1) {
    return { ...next.transform };
  }

  return {
    x: interpolateValue(prev.transform.x, next.transform.x, progress, prev.easing.x),
    y: interpolateValue(prev.transform.y, next.transform.y, progress, prev.easing.y),
    scaleX: interpolateValue(prev.transform.scaleX, next.transform.scaleX, progress, prev.easing.scaleX),
    scaleY: interpolateValue(prev.transform.scaleY, next.transform.scaleY, progress, prev.easing.scaleY),
    rotation: interpolateValue(prev.transform.rotation, next.transform.rotation, progress, prev.easing.rotation),
    opacity: interpolateValue(prev.transform.opacity, next.transform.opacity, progress, prev.easing.opacity),
  };
};

const formatKeyframesForSMIL = (keyframes: Keyframe[], property: keyof TransformParams): string => {
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  return sorted.map((k) => k.transform[property]).join(';');
};

const formatKeyframeTimes = (keyframes: Keyframe[], duration: number): string => {
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  return sorted.map((k) => (k.time / duration).toFixed(3)).join(';');
};

const formatBezierForSMIL = (curve: BezierCurve): string => {
  return `${curve.x1},${curve.y1},${curve.x2},${curve.y2}`;
};

export const generateTimelineSVG = (
  timeline: TimelineState,
  params: AnimationParams
): string => {
  const { size, color, colorSecondary, duration, loopCount, strokeWidth } = params;
  const { layers, currentTime } = timeline;

  const visibleLayers = layers.filter((l) => l.visible);
  const layerCount = visibleLayers.length;

  if (layerCount === 0) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <text x="${size / 2}" y="${size / 2}" text-anchor="middle" fill="#666" font-size="12">请添加图层</text>
</svg>`;
  }

  const dotSize = Math.max(4, size / 8);
  const spacing = layerCount > 1 ? size / (layerCount + 1) : size / 2;
  const colors = [color, colorSecondary, '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#6366f1', '#14b8a6'];

  const elements: string[] = [];

  visibleLayers.forEach((layer, index) => {
    const sortedKeyframes = [...layer.keyframes].sort((a, b) => a.time - b.time);
    const hasKeyframes = sortedKeyframes.length > 0;
    const layerColor = colors[index % colors.length];

    if (!hasKeyframes) {
      return;
    }

    const currentTransform = interpolateTransform(layer.keyframes, currentTime);
    const baseX = spacing * (index + 1);
    const baseY = size / 2;

    const animateElements: string[] = [];

    if (sortedKeyframes.length > 1) {
      const totalDuration = sortedKeyframes[sortedKeyframes.length - 1].time - sortedKeyframes[0].time;
      const adjustedDuration = totalDuration > 0 ? totalDuration : duration;

      const properties: Array<keyof TransformParams> = ['x', 'y', 'scaleX', 'scaleY', 'rotation', 'opacity'];

      properties.forEach((prop) => {
        const values = formatKeyframesForSMIL(sortedKeyframes, prop);
        const keyTimes = formatKeyframeTimes(sortedKeyframes, adjustedDuration);
        const firstKeyframe = sortedKeyframes[0];
        const bezier = formatBezierForSMIL(firstKeyframe.easing[prop]);

        if (prop === 'x' || prop === 'y') {
          const baseValue = prop === 'x' ? baseX : baseY;
          const animatedValues = sortedKeyframes
            .map((k) => (baseValue + k.transform[prop]).toFixed(2))
            .join(';');

          animateElements.push(`    <animate attributeName="${prop === 'x' ? 'cx' : 'cy'}" values="${animatedValues}" keyTimes="${keyTimes}" dur="${adjustedDuration}s" repeatCount="${getLoopValue(loopCount)}" />`);
        } else if (prop === 'scaleX' || prop === 'scaleY') {
          animateElements.push(`    <animateTransform attributeName="transform" type="scale" values="${formatKeyframesForSMIL(sortedKeyframes, prop)}" keyTimes="${keyTimes}" dur="${adjustedDuration}s" repeatCount="${getLoopValue(loopCount)}" additive="sum" />`);
        } else if (prop === 'rotation') {
          const centerX = baseX + currentTransform.x;
          const centerY = baseY + currentTransform.y;
          const rotationValues = sortedKeyframes
            .map((k) => `${k.transform.rotation} ${centerX} ${centerY}`)
            .join(';');
          animateElements.push(`    <animateTransform attributeName="transform" type="rotate" values="${rotationValues}" keyTimes="${keyTimes}" dur="${adjustedDuration}s" repeatCount="${getLoopValue(loopCount)}" additive="sum" />`);
        } else if (prop === 'opacity') {
          animateElements.push(`    <animate attributeName="opacity" values="${values}" keyTimes="${keyTimes}" dur="${adjustedDuration}s" repeatCount="${getLoopValue(loopCount)}" />`);
        }
      });
    }

    const x = baseX + currentTransform.x;
    const y = baseY + currentTransform.y;
    const opacity = currentTransform.opacity;

    elements.push(`  <circle cx="${x}" cy="${y}" r="${dotSize}" fill="${layerColor}" opacity="${opacity}">
${animateElements.join('\n')}
  </circle>`);
  });

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
${elements.join('\n')}
</svg>`;
};

export const getInterpolatedTransformForLayer = (
  layer: { keyframes: Keyframe[] },
  time: number
): TransformParams => {
  return interpolateTransform(layer.keyframes, time);
};
