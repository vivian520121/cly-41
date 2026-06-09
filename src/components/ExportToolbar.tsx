import React, { useState } from 'react';
import { Copy, Download, FileCode, Check } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { copyToClipboard, downloadSVG, svgToReactComponent } from '@/utils/exporter';
import { getTemplateById } from '@/templates';

const ExportToolbar: React.FC = () => {
  const { svgCode, selectedTemplateId, addToast } = useAppStore();
  const [copiedSVG, setCopiedSVG] = useState(false);
  const [copiedReact, setCopiedReact] = useState(false);

  const template = getTemplateById(selectedTemplateId);

  const handleCopySVG = async () => {
    const success = await copyToClipboard(svgCode);
    if (success) {
      setCopiedSVG(true);
      addToast('SVG代码已复制', 'success');
      setTimeout(() => setCopiedSVG(false), 2000);
    } else {
      addToast('复制失败', 'error');
    }
  };

  const handleDownloadSVG = () => {
    const filename = template ? `${template.name.replace(/\s+/g, '-').toLowerCase()}.svg` : 'loader.svg';
    downloadSVG(svgCode, filename);
    addToast('SVG文件已下载', 'success');
  };

  const handleCopyReact = async () => {
    const componentName = template
      ? template.name.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')
      : 'Loader';
    const reactCode = svgToReactComponent(svgCode, componentName);
    const success = await copyToClipboard(reactCode);
    if (success) {
      setCopiedReact(true);
      addToast('React组件代码已复制', 'success');
      setTimeout(() => setCopiedReact(false), 2000);
    } else {
      addToast('复制失败', 'error');
    }
  };

  return (
    <div className="bg-slate-900/50 rounded-2xl border border-white/10 p-4">
      <h3 className="text-sm font-semibold text-white mb-3">导出代码</h3>
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={handleCopySVG}
          className="flex flex-col items-center justify-center gap-2 p-4 bg-sky-500/10 border border-sky-500/30 rounded-xl hover:bg-sky-500/20 hover:border-sky-500/50 transition-all group"
        >
          {copiedSVG ? (
            <Check className="w-6 h-6 text-emerald-400" />
          ) : (
            <Copy className="w-6 h-6 text-sky-400 group-hover:scale-110 transition-transform" />
          )}
          <span className="text-xs font-medium text-sky-400">复制SVG</span>
        </button>

        <button
          onClick={handleDownloadSVG}
          className="flex flex-col items-center justify-center gap-2 p-4 bg-violet-500/10 border border-violet-500/30 rounded-xl hover:bg-violet-500/20 hover:border-violet-500/50 transition-all group"
        >
          <Download className="w-6 h-6 text-violet-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium text-violet-400">下载SVG</span>
        </button>

        <button
          onClick={handleCopyReact}
          className="flex flex-col items-center justify-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all group"
        >
          {copiedReact ? (
            <Check className="w-6 h-6 text-emerald-400" />
          ) : (
            <FileCode className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
          )}
          <span className="text-xs font-medium text-emerald-400">React组件</span>
        </button>
      </div>
    </div>
  );
};

export default ExportToolbar;
