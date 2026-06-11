import { CustomTemplate, AnimationParams } from '@/types';

export function encodeTemplateToShareURL(template: CustomTemplate): string {
  try {
    const shareData = {
      id: template.id,
      name: template.name,
      category: template.category,
      description: template.description,
      svgCode: template.svgCode,
      elements: template.elements,
      defaultParams: template.defaultParams,
    };
    const jsonStr = JSON.stringify(shareData);
    const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?template=${base64}`;
  } catch {
    return '';
  }
}

export function decodeTemplateFromShareURL(url: string): CustomTemplate | null {
  try {
    const urlObj = new URL(url);
    const templateParam = urlObj.searchParams.get('template');
    if (!templateParam) return null;

    const jsonStr = decodeURIComponent(escape(atob(templateParam)));
    const data = JSON.parse(jsonStr);

    return {
      id: data.id || `shared-${Date.now()}`,
      name: data.name || '导入的模板',
      category: data.category || 'custom',
      description: data.description || '',
      thumbnail: data.thumbnail || '',
      svgCode: data.svgCode || '',
      elements: data.elements || [],
      defaultParams: data.defaultParams || {
        size: 100,
        duration: 1,
        strokeWidth: 2,
        color: '#0ea5e9',
        colorSecondary: '#8b5cf6',
        loopCount: 0,
        easing: 'ease-in-out',
      },
      createdAt: data.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
  } catch {
    return null;
  }
}

export function getTemplateFromCurrentURL(): CustomTemplate | null {
  const currentURL = window.location.href;
  return decodeTemplateFromShareURL(currentURL);
}

export function exportTemplateAsFile(template: CustomTemplate): void {
  const json = JSON.stringify(template, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${template.name.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_')}.svgtpl`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importTemplateFromFile(file: File): Promise<CustomTemplate> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        const template: CustomTemplate = {
          id: data.id || `imported-${Date.now()}`,
          name: data.name || '导入的模板',
          category: data.category || 'custom',
          description: data.description || '',
          thumbnail: data.thumbnail || '',
          svgCode: data.svgCode || '',
          elements: data.elements || [],
          defaultParams: data.defaultParams || {
            size: 100,
            duration: 1,
            strokeWidth: 2,
            color: '#0ea5e9',
            colorSecondary: '#8b5cf6',
            loopCount: 0,
            easing: 'ease-in-out',
          } as AnimationParams,
          createdAt: data.createdAt || Date.now(),
          updatedAt: Date.now(),
        };
        resolve(template);
      } catch {
        reject(new Error('无法解析模板文件'));
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
}
