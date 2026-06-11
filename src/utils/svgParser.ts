import { CanvasElement, CanvasAnimation, CanvasShapeType } from '@/types';

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

function parseAnimationsFromElement(el: Element): CanvasAnimation[] {
  const animations: CanvasAnimation[] = [];
  const animElements = el.querySelectorAll('animate, animateTransform, animateMotion, set');

  animElements.forEach((animEl) => {
    const tagName = animEl.tagName.toLowerCase();
    const attributeName = animEl.getAttribute('attributeName') ||
      (tagName === 'animatetransform' ? 'transform' : '');

    animations.push({
      id: generateId(),
      attributeName: tagName === 'animatetransform'
        ? `transform_${animEl.getAttribute('type') || 'rotate'}`
        : attributeName,
      values: animEl.getAttribute('values') || '',
      dur: animEl.getAttribute('dur') || '1s',
      repeatCount: animEl.getAttribute('repeatCount') || 'indefinite',
      begin: animEl.getAttribute('begin') || '0s',
      fill: animEl.getAttribute('fill') || 'freeze',
      calcMode: animEl.getAttribute('calcMode') || 'linear',
      keyTimes: animEl.getAttribute('keyTimes') || '',
      keySplines: animEl.getAttribute('keySplines') || '',
    });
  });

  return animations;
}

function parseCSSAnimations(styleText: string): CanvasAnimation[] {
  const animations: CanvasAnimation[] = [];
  const keyframeRegex = /@keyframes\s+([\w-]+)\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/g;
  let match;

  while ((match = keyframeRegex.exec(styleText)) !== null) {
    const keyframeBody = match[2];

    const fromMatch = keyframeBody.match(/from\s*\{([^}]*)\}/);
    const toMatch = keyframeBody.match(/to\s*\{([^}]*)\}/);

    const fromValues: string[] = [];
    const toValues: string[] = [];
    const attrNames: string[] = [];

    if (fromMatch && toMatch) {
      const fromProps = parseCSSEntries(fromMatch[1]);
      const toProps = parseCSSEntries(toMatch[1]);

      for (const key of Object.keys(fromProps)) {
        if (toProps[key] !== undefined) {
          attrNames.push(key);
          fromValues.push(fromProps[key]);
          toValues.push(toProps[key]);
        }
      }

      if (attrNames.length > 0) {
        animations.push({
          id: generateId(),
          attributeName: `css:${attrNames.join(',')}`,
          values: `${fromValues.join(';')};${toValues.join(';')}`,
          dur: '1s',
          repeatCount: 'indefinite',
          begin: '0s',
          fill: 'forwards',
          calcMode: 'linear',
          keyTimes: '',
          keySplines: '',
        });
      }
    }
  }

  return animations;
}

function parseCSSEntries(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  const entries = text.split(';').map(e => e.trim()).filter(Boolean);
  for (const entry of entries) {
    const [key, ...valueParts] = entry.split(':');
    if (key && valueParts.length > 0) {
      result[key.trim()] = valueParts.join(':').trim();
    }
  }
  return result;
}

export function parseSVGToElements(svgString: string): CanvasElement[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svgEl = doc.querySelector('svg');

  if (!svgEl) return [];

  const elements: CanvasElement[] = [];

  const styleElements = svgEl.querySelectorAll('style');
  let cssAnimations: CanvasAnimation[] = [];
  styleElements.forEach((styleEl) => {
    cssAnimations = cssAnimations.concat(parseCSSAnimations(styleEl.textContent || ''));
  });

  const cssAnimMap = new Map<string, CanvasAnimation[]>();

  const applyStyleEl = svgEl.querySelector('style');
  if (applyStyleEl && applyStyleEl.textContent) {
    const classRegex = /\.([\w-]+)\s*\{([^}]*)\}/g;
    let classMatch;
    while ((classMatch = classRegex.exec(applyStyleEl.textContent)) !== null) {
      const className = classMatch[1];
      const styleBody = classMatch[2];
      const animMatch2 = styleBody.match(/animation\s*:\s*([\w-]+)/);
      if (animMatch2) {
        const animName = animMatch2[1];
        const matchingAnims = cssAnimations.filter(a => a.attributeName.includes(animName));
        if (matchingAnims.length > 0) {
          cssAnimMap.set(className, matchingAnims);
        }
      }
    }
  }

  const shapeSelectors: { selector: string; type: CanvasShapeType }[] = [
    { selector: 'circle', type: 'circle' },
    { selector: 'ellipse', type: 'circle' },
    { selector: 'rect', type: 'rect' },
    { selector: 'line', type: 'line' },
    { selector: 'path', type: 'path' },
  ];

  shapeSelectors.forEach(({ selector, type }) => {
    const els = svgEl.querySelectorAll(selector);
    els.forEach((el) => {
      if (el.closest('defs')) return;

      let x = 0, y = 0, width = 0, height = 0, rx = 0, ry = 0;
      let pathData = '';

      switch (type) {
        case 'circle': {
          const cx = parseFloat(el.getAttribute('cx') || '0');
          const cy = parseFloat(el.getAttribute('cy') || '0');
          const r = parseFloat(el.getAttribute('r') || el.getAttribute('rx') || '0');
          const ryAttr = el.getAttribute('ry');
          x = cx - r;
          y = cy - r;
          width = r * 2;
          height = ryAttr ? parseFloat(ryAttr) * 2 : r * 2;
          rx = r;
          ry = ryAttr ? parseFloat(ryAttr) : r;
          break;
        }
        case 'rect': {
          x = parseFloat(el.getAttribute('x') || '0');
          y = parseFloat(el.getAttribute('y') || '0');
          width = parseFloat(el.getAttribute('width') || '0');
          height = parseFloat(el.getAttribute('height') || '0');
          rx = parseFloat(el.getAttribute('rx') || '0');
          ry = parseFloat(el.getAttribute('ry') || '0');
          break;
        }
        case 'line': {
          const x1 = parseFloat(el.getAttribute('x1') || '0');
          const y1 = parseFloat(el.getAttribute('y1') || '0');
          const x2 = parseFloat(el.getAttribute('x2') || '0');
          const y2 = parseFloat(el.getAttribute('y2') || '0');
          x = Math.min(x1, x2);
          y = Math.min(y1, y2);
          width = Math.abs(x2 - x1);
          height = Math.abs(y2 - y1);
          break;
        }
        case 'path': {
          pathData = el.getAttribute('d') || '';
          const bbox = estimatePathBBox(pathData);
          x = bbox.x;
          y = bbox.y;
          width = bbox.width;
          height = bbox.height;
          break;
        }
      }

      const fillAttr = el.getAttribute('fill') || 'none';
      const strokeAttr = el.getAttribute('stroke') || 'none';
      const transform = el.getAttribute('transform') || '';
      const rotationMatch = transform.match(/rotate\(\s*([\d.-]+)/);
      const rotation = rotationMatch ? parseFloat(rotationMatch[1]) : 0;
      const translateMatch = transform.match(/translate\(\s*([\d.-]+)[,\s]+([\d.-]+)/);
      if (translateMatch) {
        x += parseFloat(translateMatch[1]);
        y += parseFloat(translateMatch[2]);
      }

      const smilAnimations = parseAnimationsFromElement(el);

      let cssAnims: CanvasAnimation[] = [];
      const classAttr = el.getAttribute('class');
      if (classAttr) {
        const classNames = classAttr.split(/\s+/);
        for (const cn of classNames) {
          const found = cssAnimMap.get(cn);
          if (found) cssAnims = cssAnims.concat(found);
        }
      }

      elements.push({
        id: generateId(),
        type,
        x,
        y,
        width,
        height,
        fill: fillAttr === 'none' ? 'none' : fillAttr,
        stroke: strokeAttr === 'none' ? 'none' : strokeAttr,
        strokeWidth: parseFloat(el.getAttribute('stroke-width') || '1'),
        opacity: parseFloat(el.getAttribute('opacity') || '1'),
        rotation,
        rx,
        ry,
        pathData,
        animations: [...smilAnimations, ...cssAnims],
      });
    });
  });

  return elements;
}

function estimatePathBBox(pathData: string): { x: number; y: number; width: number; height: number } {
  const nums = pathData.match(/-?[\d.]+/g);
  if (!nums || nums.length < 2) {
    return { x: 0, y: 0, width: 50, height: 50 };
  }

  const values = nums.map(Number);
  const xs: number[] = [];
  const ys: number[] = [];

  for (let i = 0; i < values.length - 1; i += 2) {
    xs.push(values[i]);
    ys.push(values[i + 1]);
  }

  if (xs.length === 0 || ys.length === 0) {
    return { x: 0, y: 0, width: 50, height: 50 };
  }

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    x: minX,
    y: minY,
    width: Math.max(maxX - minX, 10),
    height: Math.max(maxY - minY, 10),
  };
}

export function elementsToSVG(elements: CanvasElement[], size: number = 100): string {
  const parts: string[] = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`);

  for (const el of elements) {
    const transformParts: string[] = [];
    if (el.x !== 0 || el.y !== 0) transformParts.push(`translate(${el.x},${el.y})`);
    if (el.rotation !== 0) transformParts.push(`rotate(${el.rotation})`);
    const transform = transformParts.length > 0 ? ` transform="${transformParts.join(' ')}"` : '';

    const commonAttrs = `fill="${el.fill}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" opacity="${el.opacity}"${transform}`;

    const animParts = el.animations.map(anim => {
      if (anim.attributeName.startsWith('transform_')) {
        const animType = anim.attributeName.replace('transform_', '');
        return `<animateTransform attributeName="transform" type="${animType}" values="${anim.values}" dur="${anim.dur}" repeatCount="${anim.repeatCount}" begin="${anim.begin}"${anim.fill !== 'freeze' ? ` fill="${anim.fill}"` : ''}${anim.calcMode !== 'linear' ? ` calcMode="${anim.calcMode}"` : ''}${anim.keyTimes ? ` keyTimes="${anim.keyTimes}"` : ''}${anim.keySplines ? ` keySplines="${anim.keySplines}"` : ''}/>`;
      }
      return `<animate attributeName="${anim.attributeName}" values="${anim.values}" dur="${anim.dur}" repeatCount="${anim.repeatCount}" begin="${anim.begin}"${anim.fill !== 'freeze' ? ` fill="${anim.fill}"` : ''}${anim.calcMode !== 'linear' ? ` calcMode="${anim.calcMode}"` : ''}${anim.keyTimes ? ` keyTimes="${anim.keyTimes}"` : ''}${anim.keySplines ? ` keySplines="${anim.keySplines}"` : ''}/>`;
    }).join('\n      ');

    switch (el.type) {
      case 'circle':
        parts.push(`  <circle cx="${el.rx}" cy="${el.ry}" r="${el.rx}" ${commonAttrs}>${animParts ? '\n      ' + animParts + '\n    ' : ''}</circle>`);
        break;
      case 'rect':
        parts.push(`  <rect width="${el.width}" height="${el.height}" rx="${el.rx}" ry="${el.ry}" ${commonAttrs}>${animParts ? '\n      ' + animParts + '\n    ' : ''}</rect>`);
        break;
      case 'line':
        parts.push(`  <line x1="0" y1="0" x2="${el.width}" y2="${el.height}" ${commonAttrs}>${animParts ? '\n      ' + animParts + '\n    ' : ''}</line>`);
        break;
      case 'path':
        parts.push(`  <path d="${el.pathData}" ${commonAttrs}>${animParts ? '\n      ' + animParts + '\n    ' : ''}</path>`);
        break;
    }
  }

  parts.push('</svg>');
  return parts.join('\n');
}

export function extractAnimParamsFromSVG(svgString: string): { duration: number; color: string; strokeWidth: number } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svgEl = doc.querySelector('svg');

  if (!svgEl) return { duration: 1, color: '#0ea5e9', strokeWidth: 2 };

  let maxDur = 1;
  const allAnims = svgEl.querySelectorAll('animate, animateTransform, animateMotion');
  allAnims.forEach((anim) => {
    const dur = anim.getAttribute('dur') || '1s';
    const durNum = parseFloat(dur);
    if (durNum > maxDur) maxDur = durNum;
  });

  let color = '#0ea5e9';
  const firstShape = svgEl.querySelector('circle, rect, path, line, ellipse');
  if (firstShape) {
    const stroke = firstShape.getAttribute('stroke');
    const fill = firstShape.getAttribute('fill');
    if (stroke && stroke !== 'none') color = stroke;
    else if (fill && fill !== 'none') color = fill;
  }

  let strokeWidth = 2;
  if (firstShape) {
    const sw = firstShape.getAttribute('stroke-width');
    if (sw) strokeWidth = parseFloat(sw);
  }

  return { duration: maxDur, color, strokeWidth };
}
