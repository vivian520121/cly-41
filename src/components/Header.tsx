import React from 'react';
import { Loader2, Heart, Grid3X3, Github, Wrench } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const Header: React.FC = () => {
  const { viewMode, setViewMode, enterWorkbench } = useAppStore();

  return (
    <header className="h-16 px-6 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="h-full max-w-[1920px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
            <div className="absolute inset-0 bg-sky-400/20 blur-xl rounded-full" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
              SVG Loader Studio
            </h1>
            <p className="text-xs text-gray-500">可视化加载动画创作平台</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
            <button
              onClick={() => setViewMode('templates')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'templates'
                  ? 'bg-sky-500/20 text-sky-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              模板库
            </button>
            <button
              onClick={() => setViewMode('favorites')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'favorites'
                  ? 'bg-sky-500/20 text-sky-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Heart className="w-4 h-4" />
              收藏夹
            </button>
            <button
              onClick={() => enterWorkbench()}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'workbench'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-gray-400 hover:text-emerald-400 hover:bg-white/5'
              }`}
            >
              <Wrench className="w-4 h-4" />
              创作台
            </button>
          </div>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
