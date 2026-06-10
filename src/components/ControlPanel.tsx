import React, { useMemo } from 'react';
import { RotateCcw, Palette, Clock, Maximize2, Repeat, Zap, Move, Scale, RotateCw, Eye } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { easingOptions } from '@/utils/easingFunctions';
import { TransformParams } from '@/types';

const presetColors = [
  '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444',
  '#ec4899', '#06b6d4', '#6366f1', '#14b8a6', '#f97316',
];

const ControlPanel: React.FC = () => {
  const {
    currentParams,
    updateParams,
    resetParams,
    isCustomCode,
    timeline,
    updateKeyframeTransform,
  } = useAppStore();

  const selectedKeyframeTransform = useMemo((): TransformParams | null => {
    if (!timeline.enabled || !timeline.selectedLayerId || !timeline.selectedKeyframeId) {
      return null;
    }
    const layer = timeline.layers.find((l) => l.id === timeline.selectedLayerId);
    if (!layer) return null;
    const keyframe = layer.keyframes.find((k) => k.id === timeline.selectedKeyframeId);
    return keyframe ? keyframe.transform : null;
  }, [timeline]);

  const handleParamChange = (key: keyof typeof currentParams, value: number | string) => {
    if (isCustomCode) {
      return;
    }
    updateParams({ [key]: value });
  };

  const handleTransformChange = (key: keyof TransformParams, value: number) => {
    if (!timeline.enabled || !timeline.selectedLayerId || !timeline.selectedKeyframeId) {
      return;
    }
    updateKeyframeTransform(timeline.selectedLayerId, timeline.selectedKeyframeId, { [key]: value });
  };

  return (
    <div className="bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">参数调节</h2>
        <button
          onClick={resetParams}
          disabled={isCustomCode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            isCustomCode
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          重置
        </button>
      </div>

      <div className="p-4 space-y-5">
        {isCustomCode && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-xs text-amber-400">
              ⚠️ 当前为自定义代码模式，参数调节已禁用。修改代码后将无法使用参数面板。
            </p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <Maximize2 className="w-4 h-4 text-sky-400" />
              尺寸
            </label>
            <span className="text-sm text-sky-400 font-mono">{currentParams.size}px</span>
          </div>
          <input
            type="range"
            min="20"
            max="200"
            value={currentParams.size}
            onChange={(e) => handleParamChange('size', parseInt(e.target.value))}
            disabled={isCustomCode}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer slider disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>20px</span>
            <span>200px</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <Clock className="w-4 h-4 text-violet-400" />
              动画时长
            </label>
            <span className="text-sm text-violet-400 font-mono">{currentParams.duration}s</span>
          </div>
          <input
            type="range"
            min="0.3"
            max="5"
            step="0.1"
            value={currentParams.duration}
            onChange={(e) => handleParamChange('duration', parseFloat(e.target.value))}
            disabled={isCustomCode}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer slider disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0.3s</span>
            <span>5s</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <Zap className="w-4 h-4 text-emerald-400" />
              线条粗细
            </label>
            <span className="text-sm text-emerald-400 font-mono">{currentParams.strokeWidth}px</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={currentParams.strokeWidth}
            onChange={(e) => handleParamChange('strokeWidth', parseInt(e.target.value))}
            disabled={isCustomCode}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer slider disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1px</span>
            <span>10px</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <Palette className="w-4 h-4 text-pink-400" />
            主色调
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={currentParams.color}
              onChange={(e) => handleParamChange('color', e.target.value)}
              disabled={isCustomCode}
              className="w-10 h-10 rounded-lg cursor-pointer border-2 border-white/10 bg-transparent disabled:opacity-50"
            />
            <input
              type="text"
              value={currentParams.color}
              onChange={(e) => handleParamChange('color', e.target.value)}
              disabled={isCustomCode}
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono uppercase focus:outline-none focus:border-sky-400/50 disabled:opacity-50"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {presetColors.map((color) => (
              <button
                key={color}
                onClick={() => handleParamChange('color', color)}
                disabled={isCustomCode}
                className={`w-6 h-6 rounded-full transition-transform hover:scale-110 disabled:opacity-50 ${
                  currentParams.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <Palette className="w-4 h-4 text-cyan-400" />
            次色调
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={currentParams.colorSecondary}
              onChange={(e) => handleParamChange('colorSecondary', e.target.value)}
              disabled={isCustomCode}
              className="w-10 h-10 rounded-lg cursor-pointer border-2 border-white/10 bg-transparent disabled:opacity-50"
            />
            <input
              type="text"
              value={currentParams.colorSecondary}
              onChange={(e) => handleParamChange('colorSecondary', e.target.value)}
              disabled={isCustomCode}
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono uppercase focus:outline-none focus:border-sky-400/50 disabled:opacity-50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <Repeat className="w-4 h-4 text-amber-400" />
              循环次数
            </label>
            <span className="text-sm text-amber-400 font-mono">
              {currentParams.loopCount === 0 ? '无限' : currentParams.loopCount}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={currentParams.loopCount}
            onChange={(e) => handleParamChange('loopCount', parseInt(e.target.value))}
            disabled={isCustomCode}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer slider disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>无限</span>
            <span>10次</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <Zap className="w-4 h-4 text-orange-400" />
            缓动函数
          </label>
          <select
            value={currentParams.easing}
            onChange={(e) => handleParamChange('easing', e.target.value)}
            disabled={isCustomCode}
            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-sky-400/50 appearance-none cursor-pointer disabled:opacity-50"
          >
            {easingOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-slate-800">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {timeline.enabled && (
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Move className="w-4 h-4 text-violet-400" />
                关键帧变换
              </h3>
              {!selectedKeyframeTransform && (
                <span className="text-xs text-gray-500">请选择关键帧</span>
              )}
            </div>

            {selectedKeyframeTransform ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <Move className="w-4 h-4 text-sky-400" />
                      位置 X
                    </label>
                    <span className="text-sm text-sky-400 font-mono">{selectedKeyframeTransform.x.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={selectedKeyframeTransform.x}
                    onChange={(e) => handleTransformChange('x', parseFloat(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>-50</span>
                    <span>50</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <Move className="w-4 h-4 text-emerald-400" />
                      位置 Y
                    </label>
                    <span className="text-sm text-emerald-400 font-mono">{selectedKeyframeTransform.y.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={selectedKeyframeTransform.y}
                    onChange={(e) => handleTransformChange('y', parseFloat(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>-50</span>
                    <span>50</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <Scale className="w-4 h-4 text-pink-400" />
                      缩放 X
                    </label>
                    <span className="text-sm text-pink-400 font-mono">{selectedKeyframeTransform.scaleX.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.05"
                    value={selectedKeyframeTransform.scaleX}
                    onChange={(e) => handleTransformChange('scaleX', parseFloat(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0</span>
                    <span>2</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <Scale className="w-4 h-4 text-amber-400" />
                      缩放 Y
                    </label>
                    <span className="text-sm text-amber-400 font-mono">{selectedKeyframeTransform.scaleY.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.05"
                    value={selectedKeyframeTransform.scaleY}
                    onChange={(e) => handleTransformChange('scaleY', parseFloat(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0</span>
                    <span>2</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <RotateCw className="w-4 h-4 text-cyan-400" />
                      旋转
                    </label>
                    <span className="text-sm text-cyan-400 font-mono">{selectedKeyframeTransform.rotation.toFixed(0)}°</span>
                  </div>
                  <input
                    type="range"
                    min="-360"
                    max="360"
                    step="5"
                    value={selectedKeyframeTransform.rotation}
                    onChange={(e) => handleTransformChange('rotation', parseFloat(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>-360°</span>
                    <span>360°</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <Eye className="w-4 h-4 text-violet-400" />
                      透明度
                    </label>
                    <span className="text-sm text-violet-400 font-mono">{(selectedKeyframeTransform.opacity * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={selectedKeyframeTransform.opacity}
                    onChange={(e) => handleTransformChange('opacity', parseFloat(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-white/5 rounded-xl text-center">
                <Move className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">在时间轴上选择一个关键帧</p>
                <p className="text-xs text-gray-600 mt-1">即可在此编辑变换参数</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;
