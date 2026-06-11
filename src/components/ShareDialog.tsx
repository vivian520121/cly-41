import React, { useState, useMemo } from 'react';
import { X, Copy, Check, Share2, Link } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { encodeTemplateToShareURL, exportTemplateAsFile } from '@/utils/shareUtils';
import { copyToClipboard } from '@/utils/exporter';

const ShareDialog: React.FC<{ templateId: string; onClose: () => void }> = ({ templateId, onClose }) => {
  const { getCustomTemplateById, addToast } = useAppStore();
  const [copied, setCopied] = useState(false);

  const template = useMemo(() => getCustomTemplateById(templateId), [templateId, getCustomTemplateById]);

  const shareURL = useMemo(() => {
    if (!template) return '';
    return encodeTemplateToShareURL(template);
  }, [template]);

  const handleCopyLink = async () => {
    if (!shareURL) return;
    const success = await copyToClipboard(shareURL);
    if (success) {
      setCopied(true);
      addToast('分享链接已复制', 'success');
      setTimeout(() => setCopied(false), 2000);
    } else {
      addToast('复制失败', 'error');
    }
  };

  const handleExportFile = () => {
    if (!template) return;
    exportTemplateAsFile(template);
    addToast('模板文件已导出', 'success');
  };

  if (!template) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-400" />
            分享模板
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="p-4 bg-slate-950/50 rounded-xl border border-white/5">
            <div className="h-20 flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: template.svgCode }}
            />
          </div>

          <div className="p-3 bg-white/5 rounded-lg">
            <h4 className="text-sm font-semibold text-white">{template.name}</h4>
            {template.description && (
              <p className="text-xs text-gray-400 mt-1">{template.description}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1.5 flex items-center gap-2">
              <Link className="w-4 h-4" />
              分享链接
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareURL}
                readOnly
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs font-mono focus:outline-none truncate"
              />
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  copied
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-sky-500/20 text-sky-400 hover:bg-sky-500/30'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-1.5">
              打开此链接将自动加载模板并进入编辑状态
            </p>
          </div>

          <div className="border-t border-white/10 pt-4">
            <label className="text-sm text-gray-400 mb-1.5 block">导出为文件</label>
            <button
              onClick={handleExportFile}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-500/20 text-violet-400 rounded-lg text-sm font-medium hover:bg-violet-500/30 transition-all"
            >
              <Share2 className="w-4 h-4" />
              导出模板文件 (.svgtpl)
            </button>
            <p className="text-xs text-gray-600 mt-1.5">
              导出的文件可以分享给他人，通过"导入"功能加载
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareDialog;
