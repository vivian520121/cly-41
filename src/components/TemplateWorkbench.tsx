import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  Plus, Circle, Square, Minus, Spline, Trash2, Save, ArrowLeft,
  Play, ZoomIn, ZoomOut, Maximize2,
  Download, Upload, Share2, Edit3, ChevronDown, ChevronUp, X,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { CanvasElement, CanvasAnimation, CanvasShapeType } from '@/types';
import { exportTemplateAsFile } from '@/utils/shareUtils';
import TemplateImportDialog from './TemplateImportDialog';
import TemplateMetaEditor from './TemplateMetaEditor';
import ShareDialog from './ShareDialog';

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const defaultElement = (type: CanvasShapeType, x: number, y: number): CanvasElement => {
  const base: CanvasElement = {
    id: generateId(),
    type,
    x,
    y,
    width: 20,
    height: 20,
    fill: '#0ea5e9',
    stroke: 'none',
    strokeWidth: 1,
    opacity: 1,
    rotation: 0,
    rx: 0,
    ry: 0,
    pathData: '',
    animations: [],
  };

  switch (type) {
    case 'circle':
      return { ...base, width: 20, height: 20, rx: 10, ry: 10, fill: '#0ea5e9' };
    case 'rect':
      return { ...base, width: 30, height: 30, rx: 2, ry: 2, fill: '#8b5cf6' };
    case 'line':
      return { ...base, width: 40, height: 0, fill: 'none', stroke: '#10b981', strokeWidth: 2 };
    case 'path':
      return { ...base, width: 30, height: 30, fill: 'none', stroke: '#f59e0b', strokeWidth: 2, pathData: 'M0,15 L15,0 L30,15 L15,30 Z' };
    default:
      return base;
  }
};

const defaultAnimation = (): CanvasAnimation => ({
  id: generateId(),
  attributeName: 'opacity',
  values: '1;0.3;1',
  dur: '1s',
  repeatCount: 'indefinite',
  begin: '0s',
  fill: 'freeze',
  calcMode: 'linear',
  keyTimes: '',
  keySplines: '',
});

const smilAttributes = [
  'opacity', 'fill', 'stroke', 'stroke-width', 'r', 'cx', 'cy',
  'width', 'height', 'x', 'y', 'd', 'transform',
];

const transformTypes = ['rotate', 'scale', 'translate', 'skewX', 'skewY'];

const TemplateWorkbench: React.FC = () => {
  const {
    canvasElements, selectedElementId, currentParams,
    addCanvasElement, updateCanvasElement, deleteCanvasElement,
    setSelectedElementId, addElementAnimation, updateElementAnimation,
    deleteElementAnimation, saveWorkbenchAsTemplate,
    editingTemplateId, getCustomTemplateById, addToast,
    setViewMode,
  } = useAppStore();

  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showMetaEditor, setShowMetaEditor] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showAnimPanel, setShowAnimPanel] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedElement = useMemo(
    () => canvasElements.find(el => el.id === selectedElementId),
    [canvasElements, selectedElementId]
  );

  const editingTemplate = useMemo(
    () => editingTemplateId ? getCustomTemplateById(editingTemplateId) : null,
    [editingTemplateId, getCustomTemplateById]
  );

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-grid')) {
      setSelectedElementId(null);
    }
  }, [setSelectedElementId]);

  const handleAddShape = useCallback((type: CanvasShapeType) => {
    const el = defaultElement(type, currentParams.size / 2 - 15, currentParams.size / 2 - 15);
    addCanvasElement(el);
  }, [currentParams.size, addCanvasElement]);

  const handleElementMouseDown = useCallback((e: React.MouseEvent, el: CanvasElement) => {
    e.stopPropagation();
    setSelectedElementId(el.id);
    setIsDragging(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const scaleX = currentParams.size / rect.width;
      const scaleY = currentParams.size / rect.height;
      setDragOffset({
        x: (e.clientX - rect.left) * scaleX - el.x,
        y: (e.clientY - rect.top) * scaleY - el.y,
      });
    }
  }, [setSelectedElementId, currentParams.size]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedElementId) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scaleX = currentParams.size / rect.width;
    const scaleY = currentParams.size / rect.height;
    const newX = (e.clientX - rect.left) * scaleX - dragOffset.x;
    const newY = (e.clientY - rect.top) * scaleY - dragOffset.y;
    updateCanvasElement(selectedElementId, {
      x: Math.max(0, Math.min(currentParams.size, newX)),
      y: Math.max(0, Math.min(currentParams.size, newY)),
    });
  }, [isDragging, selectedElementId, dragOffset, currentParams.size, updateCanvasElement]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleSave = useCallback(() => {
    if (editingTemplate) {
      saveWorkbenchAsTemplate(editingTemplate.name, editingTemplate.category, editingTemplate.description);
    } else {
      setShowMetaEditor(true);
    }
  }, [editingTemplate, saveWorkbenchAsTemplate]);

  const handleSaveAs = useCallback(() => {
    setShowMetaEditor(true);
  }, []);

  const handleExportFile = useCallback(() => {
    if (!editingTemplateId) {
      addToast('请先保存模板', 'error');
      return;
    }
    const template = getCustomTemplateById(editingTemplateId);
    if (template) {
      exportTemplateAsFile(template);
      addToast('模板文件已导出', 'success');
    }
  }, [editingTemplateId, getCustomTemplateById, addToast]);

  const handleShare = useCallback(() => {
    if (!editingTemplateId) {
      addToast('请先保存模板', 'error');
      return;
    }
    setShowShareDialog(true);
  }, [editingTemplateId, addToast]);

  const handleAddAnimation = useCallback(() => {
    if (!selectedElementId) return;
    addElementAnimation(selectedElementId, defaultAnimation());
  }, [selectedElementId, addElementAnimation]);

  const handleBack = useCallback(() => {
    setViewMode('templates');
  }, [setViewMode]);

  return (
    <div className="h-full flex flex-col bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {editingTemplate ? `编辑: ${editingTemplate.name}` : '模板创作工作台'}
            </h2>
            <p className="text-xs text-gray-500">
              {canvasElements.length} 个图形元素
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportDialog(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            导入
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            保存
          </button>
          <button
            onClick={handleSaveAs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            另存为
          </button>
          <button
            onClick={handleExportFile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            导出
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            分享
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-14 border-r border-white/10 flex flex-col items-center py-3 gap-2 bg-slate-900/80">
          <span className="text-[10px] text-gray-500 mb-1">图形</span>
          <button
            onClick={() => handleAddShape('circle')}
            className="p-2.5 rounded-lg bg-white/5 text-gray-400 hover:text-sky-400 hover:bg-sky-500/10 transition-all"
            title="圆形"
          >
            <Circle className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleAddShape('rect')}
            className="p-2.5 rounded-lg bg-white/5 text-gray-400 hover:text-violet-400 hover:bg-violet-500/10 transition-all"
            title="矩形"
          >
            <Square className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleAddShape('line')}
            className="p-2.5 rounded-lg bg-white/5 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
            title="线条"
          >
            <Minus className="w-5 h-5 rotate-[-45deg]" />
          </button>
          <button
            onClick={() => handleAddShape('path')}
            className="p-2.5 rounded-lg bg-white/5 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
            title="路径"
          >
            <Spline className="w-5 h-5" />
          </button>

          <div className="w-8 border-t border-white/10 my-2" />

          <span className="text-[10px] text-gray-500 mb-1">视图</span>
          <button
            onClick={() => setZoom(z => Math.min(3, z + 0.2))}
            className="p-2.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            title="放大"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(0.5, z - 0.2))}
            className="p-2.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            title="缩小"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-2.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            title="重置缩放"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center p-6 overflow-auto bg-slate-950/30">
            <div
              ref={canvasRef}
              className="relative bg-slate-900 border border-white/10 rounded-lg overflow-hidden cursor-crosshair"
              style={{
                width: currentParams.size * zoom,
                height: currentParams.size * zoom,
              }}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            >
              <div className="canvas-grid absolute inset-0 opacity-10"
                style={{
                  backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                  backgroundSize: `${10 * zoom}px ${10 * zoom}px`,
                }}
              />

              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`0 0 ${currentParams.size} ${currentParams.size}`}
                width={currentParams.size}
                height={currentParams.size}
                className="absolute inset-0"
                style={{ width: '100%', height: '100%' }}
              >
                {canvasElements.map((el) => {
                  const isSelected = el.id === selectedElementId;
                  const transformParts: string[] = [];
                  if (el.rotation !== 0) transformParts.push(`rotate(${el.rotation} ${el.x + el.width / 2} ${el.y + el.height / 2})`);
                  const transform = transformParts.join(' ');

                  const animParts = el.animations.map(anim => {
                    if (anim.attributeName.startsWith('transform_')) {
                      const animType = anim.attributeName.replace('transform_', '');
                      return <animateTransform
                        key={anim.id}
                        attributeName="transform"
                        type={animType}
                        values={anim.values}
                        dur={anim.dur}
                        repeatCount={anim.repeatCount}
                        begin={anim.begin}
                        fill={anim.fill}
                        calcMode={anim.calcMode as 'linear' | 'discrete' | 'paced' | 'spline'}
                        keyTimes={anim.keyTimes || undefined}
                        keySplines={anim.keySplines || undefined}
                      />;
                    }
                    return <animate
                      key={anim.id}
                      attributeName={anim.attributeName}
                      values={anim.values}
                      dur={anim.dur}
                      repeatCount={anim.repeatCount}
                      begin={anim.begin}
                      fill={anim.fill}
                      calcMode={anim.calcMode as 'linear' | 'discrete' | 'paced' | 'spline'}
                      keyTimes={anim.keyTimes || undefined}
                      keySplines={anim.keySplines || undefined}
                    />;
                  });

                  const commonProps = {
                    fill: el.fill,
                    stroke: el.stroke,
                    strokeWidth: el.strokeWidth,
                    opacity: el.opacity,
                    transform: transform || undefined,
                  };

                  let shapeEl: React.ReactNode;
                  switch (el.type) {
                    case 'circle':
                      shapeEl = <circle cx={el.x + el.rx} cy={el.y + el.ry} r={el.rx} {...commonProps}>{animParts}</circle>;
                      break;
                    case 'rect':
                      shapeEl = <rect x={el.x} y={el.y} width={el.width} height={el.height} rx={el.rx} ry={el.ry} {...commonProps}>{animParts}</rect>;
                      break;
                    case 'line':
                      shapeEl = <line x1={el.x} y1={el.y} x2={el.x + el.width} y2={el.y + el.height} {...commonProps}>{animParts}</line>;
                      break;
                    case 'path':
                      shapeEl = <path d={el.pathData} {...commonProps} transform={`translate(${el.x},${el.y})${transform ? ' ' + transform : ''}`}>{animParts}</path>;
                      break;
                    default:
                      shapeEl = null;
                  }

                  return (
                    <g key={el.id}>
                      {shapeEl}
                      {isSelected && (
                        <rect
                          x={el.x - 2}
                          y={el.y - 2}
                          width={el.width + 4}
                          height={el.height + 4}
                          fill="none"
                          stroke="#0ea5e9"
                          strokeWidth={1}
                          strokeDasharray="3,3"
                          opacity={0.8}
                          pointerEvents="none"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>

              {canvasElements.map((el) => (
                <div
                  key={`hit-${el.id}`}
                  className={`absolute cursor-move ${el.id === selectedElementId ? 'ring-2 ring-sky-400/50 ring-offset-1 ring-offset-transparent' : ''}`}
                  style={{
                    left: el.x * zoom,
                    top: el.y * zoom,
                    width: Math.max(el.width * zoom, 8),
                    height: Math.max(el.height * zoom, 8),
                  }}
                  onMouseDown={(e) => handleElementMouseDown(e, el)}
                />
              ))}

              {canvasElements.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 pointer-events-none">
                  <Plus className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm opacity-60">从左侧工具栏添加图形</p>
                  <p className="text-xs opacity-40 mt-1">或点击"导入"加载SVG文件</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 border-t border-white/5 flex items-center justify-center gap-4 text-xs text-gray-500">
            <span>画布: {currentParams.size}×{currentParams.size}px</span>
            <span>•</span>
            <span>缩放: {Math.round(zoom * 100)}%</span>
            <span>•</span>
            <span>元素: {canvasElements.length}</span>
          </div>
        </div>

        <div className="w-72 border-l border-white/10 overflow-y-auto custom-scrollbar bg-slate-900/80">
          {selectedElement ? (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-sky-400" />
                  属性编辑
                </h3>
                <button
                  onClick={() => deleteCanvasElement(selectedElement.id)}
                  className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">类型</label>
                  <div className="px-3 py-2 bg-white/5 rounded-lg text-sm text-gray-300">
                    {selectedElement.type === 'circle' ? '圆形' :
                     selectedElement.type === 'rect' ? '矩形' :
                     selectedElement.type === 'line' ? '线条' : '路径'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">X</label>
                    <input
                      type="number"
                      value={Math.round(selectedElement.x)}
                      onChange={(e) => updateCanvasElement(selectedElement.id, { x: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-sky-400/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Y</label>
                    <input
                      type="number"
                      value={Math.round(selectedElement.y)}
                      onChange={(e) => updateCanvasElement(selectedElement.id, { y: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-sky-400/50"
                    />
                  </div>
                </div>

                {(selectedElement.type === 'rect' || selectedElement.type === 'circle') && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">宽度</label>
                      <input
                        type="number"
                        value={Math.round(selectedElement.width)}
                        onChange={(e) => updateCanvasElement(selectedElement.id, { width: parseFloat(e.target.value) || 1 })}
                        className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-sky-400/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">高度</label>
                      <input
                        type="number"
                        value={Math.round(selectedElement.height)}
                        onChange={(e) => updateCanvasElement(selectedElement.id, { height: parseFloat(e.target.value) || 1 })}
                        className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-sky-400/50"
                      />
                    </div>
                  </div>
                )}

                {selectedElement.type === 'rect' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">圆角X</label>
                      <input
                        type="number"
                        value={selectedElement.rx}
                        onChange={(e) => updateCanvasElement(selectedElement.id, { rx: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-sky-400/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">圆角Y</label>
                      <input
                        type="number"
                        value={selectedElement.ry}
                        onChange={(e) => updateCanvasElement(selectedElement.id, { ry: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-sky-400/50"
                      />
                    </div>
                  </div>
                )}

                {selectedElement.type === 'path' && (
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">路径数据 (d)</label>
                    <textarea
                      value={selectedElement.pathData}
                      onChange={(e) => updateCanvasElement(selectedElement.id, { pathData: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-sky-400/50 font-mono text-xs min-h-[60px]"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">填充色</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="color"
                        value={selectedElement.fill === 'none' ? '#000000' : selectedElement.fill}
                        onChange={(e) => updateCanvasElement(selectedElement.id, { fill: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer border border-white/10 bg-transparent"
                      />
                      <input
                        type="text"
                        value={selectedElement.fill}
                        onChange={(e) => updateCanvasElement(selectedElement.id, { fill: e.target.value })}
                        className="flex-1 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-sky-400/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">描边色</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="color"
                        value={selectedElement.stroke === 'none' ? '#000000' : selectedElement.stroke}
                        onChange={(e) => updateCanvasElement(selectedElement.id, { stroke: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer border border-white/10 bg-transparent"
                      />
                      <input
                        type="text"
                        value={selectedElement.stroke}
                        onChange={(e) => updateCanvasElement(selectedElement.id, { stroke: e.target.value })}
                        className="flex-1 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-sky-400/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">描边宽度</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={selectedElement.strokeWidth}
                      onChange={(e) => updateCanvasElement(selectedElement.id, { strokeWidth: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-sky-400/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">透明度</label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.05"
                      value={selectedElement.opacity}
                      onChange={(e) => updateCanvasElement(selectedElement.id, { opacity: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-sky-400/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">旋转角度</label>
                  <input
                    type="number"
                    min="-360"
                    max="360"
                    step="5"
                    value={selectedElement.rotation}
                    onChange={(e) => updateCanvasElement(selectedElement.id, { rotation: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-sky-400/50"
                  />
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Play className="w-4 h-4 text-violet-400" />
                    动画属性
                  </h4>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowAnimPanel(!showAnimPanel)}
                      className="p-1 rounded text-gray-400 hover:text-white"
                    >
                      {showAnimPanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={handleAddAnimation}
                      className="p-1 rounded-lg bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {showAnimPanel && (
                  <div className="space-y-3">
                    {selectedElement.animations.length === 0 ? (
                      <div className="p-3 bg-white/5 rounded-lg text-center">
                        <p className="text-xs text-gray-500">暂无动画</p>
                        <p className="text-xs text-gray-600 mt-1">点击 + 添加SMIL动画</p>
                      </div>
                    ) : (
                      selectedElement.animations.map((anim) => (
                        <div key={anim.id} className="p-3 bg-white/5 rounded-lg border border-white/5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-violet-400 font-medium">
                              {anim.attributeName.startsWith('transform_')
                                ? `变换: ${anim.attributeName.replace('transform_', '')}`
                                : anim.attributeName}
                            </span>
                            <button
                              onClick={() => deleteElementAnimation(selectedElement.id, anim.id)}
                              className="p-1 text-red-400 hover:text-red-300"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-500 block mb-0.5">属性名</label>
                            <select
                              value={anim.attributeName.startsWith('transform_') ? 'transform' : anim.attributeName}
                              onChange={(e) => {
                                if (e.target.value === 'transform') {
                                  updateElementAnimation(selectedElement.id, anim.id, {
                                    attributeName: 'transform_rotate',
                                    values: '0 50 50;360 50 50',
                                  });
                                } else {
                                  updateElementAnimation(selectedElement.id, anim.id, {
                                    attributeName: e.target.value,
                                  });
                                }
                              }}
                              className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-xs focus:outline-none focus:border-sky-400/50"
                            >
                              {smilAttributes.map(attr => (
                                <option key={attr} value={attr} className="bg-slate-800">{attr}</option>
                              ))}
                            </select>
                          </div>

                          {anim.attributeName.startsWith('transform_') && (
                            <div>
                              <label className="text-[10px] text-gray-500 block mb-0.5">变换类型</label>
                              <select
                                value={anim.attributeName.replace('transform_', '')}
                                onChange={(e) => updateElementAnimation(selectedElement.id, anim.id, {
                                  attributeName: `transform_${e.target.value}`,
                                })}
                                className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-xs focus:outline-none focus:border-sky-400/50"
                              >
                                {transformTypes.map(t => (
                                  <option key={t} value={t} className="bg-slate-800">{t}</option>
                                ))}
                              </select>
                            </div>
                          )}

                          <div>
                            <label className="text-[10px] text-gray-500 block mb-0.5">值序列 (分号分隔)</label>
                            <input
                              type="text"
                              value={anim.values}
                              onChange={(e) => updateElementAnimation(selectedElement.id, anim.id, { values: e.target.value })}
                              className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-xs font-mono focus:outline-none focus:border-sky-400/50"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-gray-500 block mb-0.5">时长</label>
                              <input
                                type="text"
                                value={anim.dur}
                                onChange={(e) => updateElementAnimation(selectedElement.id, anim.id, { dur: e.target.value })}
                                className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-xs focus:outline-none focus:border-sky-400/50"
                                placeholder="1s"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-500 block mb-0.5">重复</label>
                              <input
                                type="text"
                                value={anim.repeatCount}
                                onChange={(e) => updateElementAnimation(selectedElement.id, anim.id, { repeatCount: e.target.value })}
                                className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-xs focus:outline-none focus:border-sky-400/50"
                                placeholder="indefinite"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-gray-500 block mb-0.5">开始</label>
                              <input
                                type="text"
                                value={anim.begin}
                                onChange={(e) => updateElementAnimation(selectedElement.id, anim.id, { begin: e.target.value })}
                                className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-xs focus:outline-none focus:border-sky-400/50"
                                placeholder="0s"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-500 block mb-0.5">缓动</label>
                              <select
                                value={anim.calcMode}
                                onChange={(e) => updateElementAnimation(selectedElement.id, anim.id, { calcMode: e.target.value })}
                                className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-xs focus:outline-none focus:border-sky-400/50"
                              >
                                <option value="linear" className="bg-slate-800">线性</option>
                                <option value="discrete" className="bg-slate-800">离散</option>
                                <option value="paced" className="bg-slate-800">匀速</option>
                                <option value="spline" className="bg-slate-800">贝塞尔</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="p-6 bg-white/5 rounded-xl text-center">
                <Edit3 className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">点击画布上的图形</p>
                <p className="text-xs text-gray-600 mt-1">即可编辑属性和动画</p>
              </div>

              <div className="mt-4 space-y-2">
                <h4 className="text-xs text-gray-500 font-medium">元素列表</h4>
                {canvasElements.map((el, idx) => (
                  <div
                    key={el.id}
                    onClick={() => setSelectedElementId(el.id)}
                    className="flex items-center gap-2 p-2 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all"
                  >
                    <div className="w-6 h-6 rounded flex items-center justify-center text-xs"
                      style={{ backgroundColor: el.fill !== 'none' ? el.fill : 'transparent' }}>
                      {el.type === 'circle' ? <Circle className="w-4 h-4" /> :
                       el.type === 'rect' ? <Square className="w-4 h-4" /> :
                       el.type === 'line' ? <Minus className="w-4 h-4" /> :
                       <Spline className="w-4 h-4" />}
                    </div>
                    <span className="text-xs text-gray-300">
                      {el.type === 'circle' ? '圆形' :
                       el.type === 'rect' ? '矩形' :
                       el.type === 'line' ? '线条' : '路径'} {idx + 1}
                    </span>
                    {el.animations.length > 0 && (
                      <span className="ml-auto text-[10px] text-violet-400">{el.animations.length}个动画</span>
                    )}
                  </div>
                ))}
                {canvasElements.length === 0 && (
                  <p className="text-xs text-gray-600 text-center py-4">暂无图形元素</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showImportDialog && (
        <TemplateImportDialog onClose={() => setShowImportDialog(false)} />
      )}

      {showMetaEditor && (
        <TemplateMetaEditor onClose={() => setShowMetaEditor(false)} />
      )}

      {showShareDialog && editingTemplateId && (
        <ShareDialog
          templateId={editingTemplateId}
          onClose={() => setShowShareDialog(false)}
        />
      )}
    </div>
  );
};

export default TemplateWorkbench;
