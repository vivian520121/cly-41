import React, { useMemo, useState } from 'react';
import { Search, Plus, Edit3, Trash2, Share2, Download, Check } from 'lucide-react';
import TemplateCard from './TemplateCard';
import { allTemplates, categoryNames } from '@/templates';
import { useAppStore } from '@/store/useAppStore';
import { CustomTemplate } from '@/types';
import { exportTemplateAsFile } from '@/utils/shareUtils';
import ShareDialog from './ShareDialog';

const CustomTemplateCard: React.FC<{ template: CustomTemplate }> = ({ template }) => {
  const { selectTemplate, selectedTemplateId, enterWorkbench, deleteCustomTemplate, addToast } = useAppStore();
  const [showShare, setShowShare] = useState(false);

  const isSelected = selectedTemplateId === template.id;

  const handleSelect = () => {
    selectTemplate(template.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    enterWorkbench(template.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteCustomTemplate(template.id);
  };

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    exportTemplateAsFile(template);
    addToast('模板已导出', 'success');
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShare(true);
  };

  return (
    <>
      <div
        onClick={handleSelect}
        className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-300 ${
          isSelected
            ? 'bg-emerald-500/10 border-2 border-emerald-400 shadow-lg shadow-emerald-500/20'
            : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
        }`}
      >
        <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleEdit}
            className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 transition-all"
            title="编辑"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all"
            title="分享"
          >
            <Share2 className="w-3 h-3" />
          </button>
          <button
            onClick={handleExport}
            className="p-1.5 rounded-lg bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-all"
            title="导出"
          >
            <Download className="w-3 h-3" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
            title="删除"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        <div
          className="h-20 flex items-center justify-center mb-2 bg-slate-900/50 rounded-lg"
          dangerouslySetInnerHTML={{ __html: template.svgCode }}
        />

        <h3 className="text-xs font-semibold text-white truncate">{template.name}</h3>
        <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">
          {template.description || '自定义模板'}
        </p>

        {isSelected && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-slate-900" />
          </div>
        )}

        <div className="absolute top-1.5 left-1.5">
          <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] rounded font-medium">
            我的
          </span>
        </div>
      </div>

      {showShare && (
        <ShareDialog
          templateId={template.id}
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  );
};

const TemplateGallery: React.FC = () => {
  const { selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, customTemplates, enterWorkbench } = useAppStore();

  const categories = ['all', 'custom', 'circular', 'dots', 'pulse', 'glitch', 'pixel', 'bars'];

  const categoryDisplayNames: Record<string, string> = {
    ...categoryNames,
    custom: '我的模板',
    all: '全部',
  };

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'custom') return [];
    return allTemplates.filter((template) => {
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const filteredCustomTemplates = useMemo(() => {
    if (selectedCategory !== 'all' && selectedCategory !== 'custom') return [];
    return customTemplates.filter((template) => {
      if (selectedCategory === 'custom') {
        const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
      }
      return template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [selectedCategory, searchQuery, customTemplates]);

  return (
    <div className="h-full flex flex-col bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">模板库</h2>
          <button
            onClick={() => enterWorkbench()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            创建模板
          </button>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索模板..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-sky-400/50 transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isCustomCat = category === 'custom';
            const count = isCustomCat ? customTemplates.length : undefined;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === category
                    ? isCustomCat
                      ? 'bg-emerald-500 text-white'
                      : 'bg-sky-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {categoryDisplayNames[category]}
                {count !== undefined && count > 0 && (
                  <span className="ml-1 opacity-70">({count})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {selectedCategory === 'custom' ? (
          filteredCustomTemplates.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredCustomTemplates.map((template) => (
                <CustomTemplateCard key={template.id} template={template} />
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <div className="text-4xl mb-2">✨</div>
              <p className="text-sm mb-3">还没有自定义模板</p>
              <button
                onClick={() => enterWorkbench()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                创建第一个模板
              </button>
            </div>
          )
        ) : (
          <>
            {filteredCustomTemplates.length > 0 && selectedCategory === 'all' && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1">
                  我的模板
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {filteredCustomTemplates.map((template) => (
                    <CustomTemplateCard key={template.id} template={template} />
                  ))}
                </div>
                <div className="border-t border-white/10" />
              </div>
            )}
            
            {filteredTemplates.length > 0 ? (
              <div>
                {filteredCustomTemplates.length > 0 && selectedCategory === 'all' && (
                  <h3 className="text-xs font-semibold text-gray-500 mb-2 mt-2">内置模板</h3>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {filteredTemplates.map((template) => (
                    <TemplateCard key={template.id} template={template} />
                  ))}
                </div>
              </div>
            ) : filteredCustomTemplates.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <div className="text-4xl mb-2">🔍</div>
                <p className="text-sm">没有找到匹配的模板</p>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default TemplateGallery;
