import React from 'react';
import { Trash2, Play, Heart } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getTemplateById, categoryNames } from '@/templates';

const FavoriteList: React.FC = () => {
  const { favorites, removeFavorite, selectTemplate, updateParams } = useAppStore();

  const handleApply = (favorite: typeof favorites[0]) => {
    selectTemplate(favorite.templateId);
    updateParams(favorite.params);
  };

  if (favorites.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-900/50 rounded-2xl border border-white/10 p-8">
        <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-pink-400 opacity-50" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">暂无收藏</h3>
        <p className="text-sm text-gray-500 text-center max-w-xs">
          点击模板卡片上的心形按钮，将常用的加载动画添加到收藏夹
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white">我的收藏</h2>
        <p className="text-xs text-gray-500 mt-1">共 {favorites.length} 个收藏</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="space-y-3">
          {favorites.map((favorite) => {
            const template = getTemplateById(favorite.templateId);
            const svgCode = template?.generate(favorite.params) || '';
            const category = template?.category || 'other';

            return (
              <div
                key={favorite.id}
                className="group p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-slate-950/50 rounded-lg"
                    dangerouslySetInnerHTML={{ __html: svgCode }}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-white truncate">
                        {favorite.name}
                      </h3>
                      <span className="px-1.5 py-0.5 bg-sky-500/20 text-sky-400 text-xs rounded">
                        {categoryNames[category]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{favorite.params.size}px</span>
                      <span>•</span>
                      <span>{favorite.params.duration}s</span>
                      <span>•</span>
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: favorite.params.color }} />
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {new Date(favorite.createdAt).toLocaleDateString('zh-CN')}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleApply(favorite)}
                      className="p-2 rounded-lg bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 transition-all"
                      title="应用此配置"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeFavorite(favorite.id)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                      title="删除收藏"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FavoriteList;
