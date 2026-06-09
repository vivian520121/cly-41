import React from 'react';
import { Sun, Moon, Grid3X3, Heart, HeartOff } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getTemplateById } from '@/templates';

const PreviewArea: React.FC = () => {
  const {
    svgCode,
    previewBackground,
    setPreviewBackground,
    selectedTemplateId,
    currentParams,
    toggleFavorite,
    favorites,
    isCustomCode,
  } = useAppStore();

  const template = getTemplateById(selectedTemplateId);
  const isFavorite = favorites.some(
    f => f.templateId === selectedTemplateId && JSON.stringify(f.params) === JSON.stringify(currentParams)
  );

  const getBackgroundClass = () => {
    switch (previewBackground) {
      case 'light':
        return 'bg-white';
      case 'checkerboard':
        return 'bg-[linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc),linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc)] bg-[length:20px_20px] bg-[position:0_0,10px_10px]';
      default:
        return 'bg-slate-900';
    }
  };

  const handleFavoriteClick = () => {
    if (template) {
      toggleFavorite(selectedTemplateId, currentParams);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            {isCustomCode ? '自定义代码' : template?.name || '预览'}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {isCustomCode ? '正在编辑自定义SVG代码' : template?.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleFavoriteClick}
            className={`p-2 rounded-lg transition-all ${
              isFavorite
                ? 'bg-pink-500/20 text-pink-400'
                : 'bg-white/5 text-gray-400 hover:text-pink-400 hover:bg-white/10'
            }`}
            title={isFavorite ? '取消收藏' : '添加到收藏夹'}
          >
            {isFavorite ? <Heart className="w-5 h-5 fill-current" /> : <HeartOff className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-center gap-2 py-3 border-b border-white/5">
          <span className="text-xs text-gray-500 mr-2">背景:</span>
          <button
            onClick={() => setPreviewBackground('dark')}
            className={`p-2 rounded-lg transition-all ${
              previewBackground === 'dark'
                ? 'bg-sky-500/20 text-sky-400 ring-2 ring-sky-400/50'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            title="深色背景"
          >
            <Moon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPreviewBackground('light')}
            className={`p-2 rounded-lg transition-all ${
              previewBackground === 'light'
                ? 'bg-sky-500/20 text-sky-400 ring-2 ring-sky-400/50'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            title="浅色背景"
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPreviewBackground('checkerboard')}
            className={`p-2 rounded-lg transition-all ${
              previewBackground === 'checkerboard'
                ? 'bg-sky-500/20 text-sky-400 ring-2 ring-sky-400/50'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            title="棋盘格背景"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div
            className={`relative w-full h-full min-h-[300px] rounded-xl flex items-center justify-center transition-all duration-300 ${getBackgroundClass()}`}
          >
            <div
              className="preview-container will-change-transform"
              dangerouslySetInnerHTML={{ __html: svgCode }}
            />
            
            <div className="absolute bottom-4 left-4 text-xs text-gray-500 font-mono">
              {currentParams.size} × {currentParams.size}px
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <span>时长: {currentParams.duration}s</span>
            <span>•</span>
            <span>循环: {currentParams.loopCount === 0 ? '无限' : currentParams.loopCount + '次'}</span>
            <span>•</span>
            <span>线宽: {currentParams.strokeWidth}px</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewArea;
