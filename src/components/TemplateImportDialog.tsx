import React, { useState, useRef } from 'react';
import { Upload, Link, X, FileText, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { parseSVGToElements, extractAnimParamsFromSVG } from '@/utils/svgParser';
import { importTemplateFromFile } from '@/utils/shareUtils';
import { CustomTemplate } from '@/types';

const TemplateImportDialog: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addCustomTemplate, setCanvasElements, currentParams, updateParams, addToast, enterWorkbench } = useAppStore();
  const [mode, setMode] = useState<'file' | 'url' | 'template'>('file');
  const [urlInput, setUrlInput] = useState('');
  const [svgPreview, setSvgPreview] = useState('');
  const [parsedElements, setParsedElements] = useState<import('@/types').CanvasElement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    if (file.name.endsWith('.svgtpl')) {
      try {
        const template = await importTemplateFromFile(file);
        addCustomTemplate(template);
        addToast('模板文件已导入', 'success');
        enterWorkbench(template.id);
        onClose();
        return;
      } catch {
        setError('无法解析模板文件');
        return;
      }
    }

    if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const svgStr = ev.target?.result as string;
        processSVG(svgStr);
      };
      reader.readAsText(file);
    } else {
      setError('请选择SVG文件(.svg)或模板文件(.svgtpl)');
    }
  };

  const handleUrlImport = async () => {
    if (!urlInput.trim()) return;
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(urlInput.trim());
      if (!response.ok) throw new Error('无法获取文件');
      const text = await response.text();
      if (!text.includes('<svg')) throw new Error('URL返回的内容不是有效的SVG');
      processSVG(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : '无法从URL导入SVG');
    } finally {
      setIsLoading(false);
    }
  };

  const processSVG = (svgString: string) => {
    try {
      const elements = parseSVGToElements(svgString);
      const params = extractAnimParamsFromSVG(svgString);

      setSvgPreview(svgString);
      setParsedElements(elements);

      updateParams({
        duration: params.duration,
        color: params.color,
        strokeWidth: params.strokeWidth,
      });
    } catch {
      setError('SVG解析失败，请检查文件格式');
    }
  };

  const handleImportToCanvas = () => {
    if (parsedElements.length === 0) {
      setError('未找到可导入的图形元素');
      return;
    }
    setCanvasElements(parsedElements);
    addToast(`已导入 ${parsedElements.length} 个图形元素`, 'success');
    onClose();
  };

  const handleImportAsTemplate = () => {
    if (!svgPreview) return;

    const elements = parsedElements.length > 0 ? parsedElements : parseSVGToElements(svgPreview);
    const params = extractAnimParamsFromSVG(svgPreview);

    const template: CustomTemplate = {
      id: `imported-${Date.now()}`,
      name: '导入的模板',
      category: 'custom',
      description: '从外部导入的SVG模板',
      thumbnail: '',
      svgCode: svgPreview,
      elements,
      defaultParams: {
        size: currentParams.size,
        duration: params.duration,
        strokeWidth: params.strokeWidth,
        color: params.color,
        colorSecondary: '#8b5cf6',
        loopCount: 0,
        easing: 'ease-in-out',
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    addCustomTemplate(template);
    addToast('SVG已导入为自定义模板', 'success');
    enterWorkbench(template.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">导入SVG</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setMode('file')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'file'
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              <Upload className="w-4 h-4" />
              本地文件
            </button>
            <button
              onClick={() => setMode('url')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'url'
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              <Link className="w-4 h-4" />
              URL导入
            </button>
          </div>

          {mode === 'file' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".svg,.svgtpl"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-8 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center gap-3 text-gray-400 hover:border-sky-400/30 hover:text-sky-400 transition-all"
              >
                <Upload className="w-10 h-10" />
                <span className="text-sm">点击选择文件</span>
                <span className="text-xs text-gray-600">支持 .svg 和 .svgtpl 格式</span>
              </button>
            </div>
          )}

          {mode === 'url' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="输入SVG文件的URL地址..."
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-sky-400/50"
                />
                <button
                  onClick={handleUrlImport}
                  disabled={isLoading || !urlInput.trim()}
                  className="px-4 py-2.5 bg-sky-500/20 text-sky-400 rounded-lg text-sm font-medium hover:bg-sky-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? '加载中...' : '导入'}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          {svgPreview && (
            <div className="mt-4 space-y-3">
              <div className="p-4 bg-slate-950/50 rounded-xl border border-white/5">
                <div
                  className="h-32 flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: svgPreview }}
                />
              </div>

              <div className="p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <FileText className="w-4 h-4" />
                  <span>解析结果: {parsedElements.length} 个图形元素</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleImportToCanvas}
                  className="px-4 py-2.5 bg-sky-500/20 text-sky-400 rounded-lg text-sm font-medium hover:bg-sky-500/30 transition-all"
                >
                  导入到画布编辑
                </button>
                <button
                  onClick={handleImportAsTemplate}
                  className="px-4 py-2.5 bg-violet-500/20 text-violet-400 rounded-lg text-sm font-medium hover:bg-violet-500/30 transition-all"
                >
                  保存为模板
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateImportDialog;
