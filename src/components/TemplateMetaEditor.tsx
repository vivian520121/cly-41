import React, { useState } from 'react';
import { X, Save, Camera } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { TemplateCategory } from '@/types';

const metaCategories: { value: TemplateCategory; label: string }[] = [
  { value: 'custom', label: '自定义' },
  { value: 'circular', label: '环形' },
  { value: 'dots', label: '点阵' },
  { value: 'pulse', label: '脉冲' },
  { value: 'glitch', label: '故障风' },
  { value: 'pixel', label: '像素方块' },
  { value: 'bars', label: '条形' },
  { value: 'other', label: '其他' },
];

const TemplateMetaEditor: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    editingTemplateId, getCustomTemplateById,
    saveWorkbenchAsTemplate, addToast, canvasElements,
  } = useAppStore();

  const existingTemplate = editingTemplateId ? getCustomTemplateById(editingTemplateId) : null;

  const [name, setName] = useState(existingTemplate?.name || '');
  const [category, setCategory] = useState<string>(existingTemplate?.category || 'custom');
  const [description, setDescription] = useState(existingTemplate?.description || '');

  const handleSave = () => {
    if (!name.trim()) {
      addToast('请输入模板名称', 'error');
      return;
    }

    if (canvasElements.length === 0) {
      addToast('画布为空，请先添加图形元素', 'error');
      return;
    }

    saveWorkbenchAsTemplate(name.trim(), category, description.trim());
    addToast(editingTemplateId ? '模板已更新' : '模板已保存', 'success');
    onClose();
  };

  const handleThumbnailCapture = () => {
    addToast('缩略图已自动生成', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            {editingTemplateId ? '编辑模板信息' : '保存新模板'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">模板名称 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：旋转渐变环"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-sky-400/50"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">分类</label>
            <div className="flex flex-wrap gap-2">
              {metaCategories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    category === cat.value
                      ? 'bg-sky-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简要描述这个模板的动画效果..."
              rows={3}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-sky-400/50 resize-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">缩略图</label>
            <button
              onClick={handleThumbnailCapture}
              className="w-full p-4 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:border-sky-400/30 hover:text-sky-400 transition-all"
            >
              <Camera className="w-5 h-5" />
              <span className="text-sm">自动生成缩略图</span>
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-white/5 text-gray-400 rounded-lg text-sm font-medium hover:bg-white/10 transition-all"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-500/20 text-sky-400 rounded-lg text-sm font-medium hover:bg-sky-500/30 transition-all"
            >
              <Save className="w-4 h-4" />
              {editingTemplateId ? '更新模板' : '保存模板'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateMetaEditor;
