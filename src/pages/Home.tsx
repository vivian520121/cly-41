import React, { useEffect } from 'react';
import Header from '@/components/Header';
import TemplateGallery from '@/components/TemplateGallery';
import PreviewArea from '@/components/PreviewArea';
import ControlPanel from '@/components/ControlPanel';
import CodeEditor from '@/components/CodeEditor';
import ExportToolbar from '@/components/ExportToolbar';
import FavoriteList from '@/components/FavoriteList';
import Toast from '@/components/Toast';
import TimelinePanel from '@/components/TimelinePanel';
import TemplateWorkbench from '@/components/TemplateWorkbench';
import { useAppStore } from '@/store/useAppStore';

const Home: React.FC = () => {
  const { viewMode, loadSharedTemplate } = useAppStore();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('template')) {
      loadSharedTemplate();
    }
  }, [loadSharedTemplate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.1),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      <Toast />
      <Header />
      
      <main className="relative max-w-[1920px] mx-auto px-4 py-6">
        {viewMode === 'workbench' ? (
          <div className="h-[calc(100vh-120px)]">
            <TemplateWorkbench />
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-120px)]">
            <div className="col-span-12 lg:col-span-3 xl:col-span-3">
              {viewMode === 'templates' ? <TemplateGallery /> : <FavoriteList />}
            </div>

            <div className="col-span-12 lg:col-span-5 xl:col-span-6">
              <div className="h-full flex flex-col gap-6">
                <div className="flex-1">
                  <PreviewArea />
                </div>
                <TimelinePanel />
                <ExportToolbar />
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 xl:col-span-3">
              <div className="h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-1">
                <ControlPanel />
                <CodeEditor />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
