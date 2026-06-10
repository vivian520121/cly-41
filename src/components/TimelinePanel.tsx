import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Layers,
  ZoomIn,
  ZoomOut,
  Clock,
  Diamond,
  GripVertical,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Keyframe, TransformParams } from '@/types';
import BezierEditor from './BezierEditor';

const TimelinePanel: React.FC = () => {
  const {
    timeline,
    currentParams,
    setTimelineEnabled,
    setCurrentTime,
    setIsPlaying,
    setTimelineZoom,
    selectLayer,
    selectKeyframe,
    toggleLayerVisibility,
    toggleLayerLock,
    addKeyframe,
    removeKeyframe,
    updateKeyframeTime,
    addLayer,
    removeLayer,
    updateLayerPhaseOffset,
  } = useAppStore();

  const timelineRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [draggingKeyframe, setDraggingKeyframe] = useState<{ layerId: string; keyframeId: string } | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);
  const [showBezierEditor, setShowBezierEditor] = useState(false);
  const [selectedEasingProperty, setSelectedEasingProperty] = useState<keyof Keyframe['easing']>('y');

  const pixelsPerSecond = 100 * timeline.zoom;
  const timelineWidth = timeline.duration * pixelsPerSecond;

  const handlePlayPause = () => {
    if (timeline.currentTime >= timeline.duration) {
      setCurrentTime(0);
    }
    setIsPlaying(!timeline.isPlaying);
  };

  const handleStepBackward = () => {
    const step = 0.05;
    setCurrentTime(Math.max(0, timeline.currentTime - step));
  };

  const handleStepForward = () => {
    const step = 0.05;
    setCurrentTime(Math.min(timeline.duration, timeline.currentTime + step));
  };

  const handleAddKeyframe = () => {
    if (!timeline.selectedLayerId) {
      if (timeline.layers.length === 0) {
        addLayer({
          name: `图层 ${timeline.layers.length + 1}`,
          elementId: `element-${timeline.layers.length}`,
          visible: true,
          locked: false,
          keyframes: [],
          phaseOffset: 0,
        });
      } else {
        selectLayer(timeline.layers[0].id);
      }
      return;
    }
    addKeyframe(timeline.selectedLayerId, timeline.currentTime);
  };

  const handleRemoveKeyframe = () => {
    if (timeline.selectedLayerId && timeline.selectedKeyframeId) {
      removeKeyframe(timeline.selectedLayerId, timeline.selectedKeyframeId);
    }
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || isDraggingPlayhead) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x / rect.width) * timeline.duration;
    setCurrentTime(Math.max(0, Math.min(timeline.duration, time)));
  };

  const handlePlayheadMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingPlayhead(true);
  };

  const handleKeyframeMouseDown = (
    e: React.MouseEvent,
    layerId: string,
    keyframeId: string,
    keyframe: Keyframe
  ) => {
    e.stopPropagation();
    selectKeyframe(layerId, keyframeId);
    setDraggingKeyframe({ layerId, keyframeId });
    setDragStartX(e.clientX);
    setDragStartTime(keyframe.time);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingPlayhead && timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const time = (x / rect.width) * timeline.duration;
        setCurrentTime(Math.max(0, Math.min(timeline.duration, time)));
      }

      if (draggingKeyframe && timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const deltaX = e.clientX - dragStartX;
        const deltaTime = (deltaX / rect.width) * timeline.duration;
        const newTime = Math.max(0, Math.min(timeline.duration, dragStartTime + deltaTime));
        updateKeyframeTime(draggingKeyframe.layerId, draggingKeyframe.keyframeId, newTime);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingPlayhead(false);
      setDraggingKeyframe(null);
    };

    if (isDraggingPlayhead || draggingKeyframe) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingPlayhead, draggingKeyframe, dragStartX, dragStartTime, timeline.duration, setCurrentTime, updateKeyframeTime]);

  const handleZoomIn = () => {
    setTimelineZoom(Math.min(5, timeline.zoom + 0.25));
  };

  const handleZoomOut = () => {
    setTimelineZoom(Math.max(0.5, timeline.zoom - 0.25));
  };

  const handleAddLayer = () => {
    addLayer({
      name: `图层 ${timeline.layers.length + 1}`,
      elementId: `element-${timeline.layers.length}`,
      visible: true,
      locked: false,
      keyframes: [],
      phaseOffset: 0,
    });
  };

  const formatTime = (time: number): string => {
    return `${time.toFixed(2)}s`;
  };

  const renderTimeMarkers = () => {
    const markers = [];
    const interval = timeline.zoom > 2 ? 0.1 : timeline.zoom > 1 ? 0.2 : 0.5;
    for (let t = 0; t <= timeline.duration; t += interval) {
      markers.push(
        <div
          key={t}
          className="absolute top-0 bottom-0 border-l border-white/10"
          style={{ left: `${(t / timeline.duration) * 100}%` }}
        >
          <span className="absolute top-0 left-1 text-[10px] text-gray-500 font-mono">
            {t.toFixed(1)}s
          </span>
        </div>
      );
    }
    return markers;
  };

  const getSelectedKeyframe = (): Keyframe | null => {
    if (!timeline.selectedLayerId || !timeline.selectedKeyframeId) return null;
    const layer = timeline.layers.find((l) => l.id === timeline.selectedLayerId);
    if (!layer) return null;
    return layer.keyframes.find((k) => k.id === timeline.selectedKeyframeId) || null;
  };

  const selectedKeyframe = getSelectedKeyframe();

  if (!timeline.enabled) {
    return (
      <div className="bg-slate-900/50 rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-center gap-4">
          <Clock className="w-6 h-6 text-gray-500" />
          <div className="text-center">
            <p className="text-gray-400 mb-2">关键帧编辑器未启用</p>
            <button
              onClick={() => {
                setTimelineEnabled(true);
              }}
              className="px-4 py-2 bg-sky-500/20 text-sky-400 rounded-lg hover:bg-sky-500/30 transition-all text-sm font-medium"
            >
              启用关键帧编辑器
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden">
      <div className="p-3 border-b border-white/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            时间轴编辑器
          </h3>
          <button
            onClick={() => setTimelineEnabled(false)}
            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded transition-all"
          >
            关闭
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleStepBackward}
            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            title="上一帧"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={handlePlayPause}
            className={`p-2.5 rounded-lg transition-all ${
              timeline.isPlaying
                ? 'bg-sky-500 text-white'
                : 'bg-sky-500/20 text-sky-400 hover:bg-sky-500/30'
            }`}
            title={timeline.isPlaying ? '暂停' : '播放'}
          >
            {timeline.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={handleStepForward}
            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            title="下一帧"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-white/10 mx-2" />

          <button
            onClick={handleAddKeyframe}
            className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all"
            title="添加关键帧"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleRemoveKeyframe}
            disabled={!timeline.selectedKeyframeId}
            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="删除关键帧"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-white/10 mx-2" />

          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            title="缩小"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-500 font-mono w-12 text-center">
            {(timeline.zoom * 100).toFixed(0)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            title="放大"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="font-mono">{formatTime(timeline.currentTime)}</span>
          <span>/</span>
          <span className="font-mono">{formatTime(timeline.duration)}</span>
        </div>
      </div>

      <div className="flex">
        <div className="w-48 border-r border-white/10 flex-shrink-0">
          <div className="p-2 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Layers className="w-3 h-3" />
              图层
            </span>
            <button
              onClick={handleAddLayer}
              className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-all"
              title="添加图层"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {timeline.layers.map((layer) => (
            <div
              key={layer.id}
              onClick={() => selectLayer(layer.id)}
              className={`p-2 border-b border-white/5 flex items-center gap-2 cursor-pointer transition-all ${
                timeline.selectedLayerId === layer.id
                  ? 'bg-sky-500/10 border-l-2 border-l-sky-500'
                  : 'hover:bg-white/5 border-l-2 border-l-transparent'
              }`}
            >
              <GripVertical className="w-3 h-3 text-gray-600" />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLayerVisibility(layer.id);
                }}
                className="p-0.5 rounded hover:bg-white/10 transition-all"
              >
                {layer.visible ? (
                  <Eye className="w-3.5 h-3.5 text-gray-400" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-gray-600" />
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLayerLock(layer.id);
                }}
                className="p-0.5 rounded hover:bg-white/10 transition-all"
              >
                {layer.locked ? (
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                ) : (
                  <Unlock className="w-3.5 h-3.5 text-gray-400" />
                )}
              </button>

              <span className={`text-xs flex-1 truncate ${layer.visible ? 'text-gray-300' : 'text-gray-600'}`}>
                {layer.name}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeLayer(layer.id);
                }}
                className="p-0.5 rounded hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}

          {timeline.layers.length === 0 && (
            <div className="p-4 text-center text-xs text-gray-600">
              暂无图层
            </div>
          )}
        </div>

        <div className="flex-1 overflow-x-auto custom-scrollbar">
          <div
            ref={timelineRef}
            className="relative h-full min-w-[600px] cursor-crosshair"
            style={{ width: `${Math.max(600, timelineWidth)}px` }}
            onClick={handleTimelineClick}
          >
            <div className="relative h-7 border-b border-white/5 overflow-hidden">
              {renderTimeMarkers()}
            </div>

            {timeline.layers.map((layer) => (
              <div
                key={layer.id}
                className="relative h-10 border-b border-white/5 hover:bg-white/[0.02]"
                onClick={() => selectLayer(layer.id)}
              >
                {layer.keyframes.map((keyframe) => (
                  <div
                    key={keyframe.id}
                    onMouseDown={(e) => handleKeyframeMouseDown(e, layer.id, keyframe.id, keyframe)}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectKeyframe(layer.id, keyframe.id);
                    }}
                    className={`absolute top-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125 z-10 ${
                      timeline.selectedKeyframeId === keyframe.id
                        ? 'scale-125'
                        : ''
                    }`}
                    style={{ left: `${(keyframe.time / timeline.duration) * 100}%` }}
                  >
                    <Diamond
                      className={`w-4 h-4 ${
                        timeline.selectedKeyframeId === keyframe.id
                          ? 'text-sky-400 fill-sky-400'
                          : 'text-amber-400 fill-amber-400'
                      } ${layer.locked ? 'opacity-50' : ''}`}
                    />
                  </div>
                ))}
              </div>
            ))}

            <div
              ref={playheadRef}
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
              style={{ left: `${(timeline.currentTime / timeline.duration) * 100}%` }}
            >
              <div
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rotate-45 cursor-ew-resize pointer-events-auto"
                onMouseDown={handlePlayheadMouseDown}
              />
            </div>
          </div>
        </div>
      </div>

      {selectedKeyframe && (
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400">
              关键帧参数 - {formatTime(selectedKeyframe.time)}
            </span>
            <button
              onClick={() => setShowBezierEditor(!showBezierEditor)}
              className={`text-xs px-2 py-1 rounded transition-all ${
                showBezierEditor
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {showBezierEditor ? '隐藏曲线编辑器' : '贝塞尔曲线'}
            </button>
          </div>

          <div className="grid grid-cols-6 gap-2 mb-3">
            {(['x', 'y', 'scaleX', 'scaleY', 'rotation', 'opacity'] as Array<keyof TransformParams>).map((prop) => (
              <div key={prop} className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase block">
                  {prop === 'scaleX' ? '缩放X' : prop === 'scaleY' ? '缩放Y' : prop === 'rotation' ? '旋转' : prop === 'opacity' ? '透明度' : prop.toUpperCase()}
                </label>
                <input
                  type="number"
                  step={prop === 'opacity' ? 0.1 : prop === 'rotation' ? 5 : 1}
                  value={selectedKeyframe.transform[prop]}
                  onChange={(e) => {
                    if (timeline.selectedLayerId && timeline.selectedKeyframeId) {
                      const value = parseFloat(e.target.value);
                      useAppStore.getState().updateKeyframeTransform(
                        timeline.selectedLayerId,
                        timeline.selectedKeyframeId,
                        { [prop]: value }
                      );
                    }
                  }}
                  className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white font-mono focus:outline-none focus:border-sky-400/50"
                />
              </div>
            ))}
          </div>

          {showBezierEditor && (
            <div className="pt-3 border-t border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-gray-500">属性:</span>
                <select
                  value={selectedEasingProperty}
                  onChange={(e) => setSelectedEasingProperty(e.target.value as keyof Keyframe['easing'])}
                  className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none focus:border-sky-400/50"
                >
                  {(['x', 'y', 'scaleX', 'scaleY', 'rotation', 'opacity'] as Array<keyof Keyframe['easing']>).map((prop) => (
                    <option key={prop} value={prop}>
                      {prop === 'scaleX' ? '缩放X' : prop === 'scaleY' ? '缩放Y' : prop === 'rotation' ? '旋转' : prop === 'opacity' ? '透明度' : prop.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <BezierEditor
                curve={selectedKeyframe.easing[selectedEasingProperty]}
                onChange={(curve) => {
                  if (timeline.selectedLayerId && timeline.selectedKeyframeId) {
                    useAppStore.getState().updateKeyframeEasing(
                      timeline.selectedLayerId,
                      timeline.selectedKeyframeId,
                      selectedEasingProperty,
                      curve
                    );
                  }
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TimelinePanel;
