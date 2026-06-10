import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BezierCurve } from '@/types';

interface BezierEditorProps {
  curve: BezierCurve;
  onChange: (curve: BezierCurve) => void;
}

const BezierEditor: React.FC<BezierEditorProps> = ({ curve, onChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [draggingControl, setDraggingControl] = useState<'cp1' | 'cp2' | null>(null);
  const [hoveredControl, setHoveredControl] = useState<'cp1' | 'cp2' | null>(null);

  const width = 200;
  const height = 200;
  const padding = 20;
  const graphSize = width - padding * 2;

  const toCanvasX = (x: number) => padding + x * graphSize;
  const toCanvasY = (y: number) => height - padding - y * graphSize;
  const fromCanvasX = (x: number) => (x - padding) / graphSize;
  const fromCanvasY = (y: number) => (height - padding - y) / graphSize;

  const drawCurve = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {
      const x = padding + (i / 4) * graphSize;
      const y = height - padding - (i / 4) * graphSize;

      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(padding, padding, graphSize, graphSize);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(toCanvasX(0), toCanvasY(0));
    ctx.lineTo(toCanvasX(curve.x1), toCanvasY(curve.y1));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toCanvasX(1), toCanvasY(1));
    ctx.lineTo(toCanvasX(curve.x2), toCanvasY(curve.y2));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(toCanvasX(0), toCanvasY(0));
    ctx.bezierCurveTo(
      toCanvasX(curve.x1), toCanvasY(curve.y1),
      toCanvasX(curve.x2), toCanvasY(curve.y2),
      toCanvasX(1), toCanvasY(1)
    );
    ctx.stroke();

    ctx.fillStyle = '#0ea5e9';
    ctx.beginPath();
    ctx.arc(toCanvasX(0), toCanvasY(0), 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(toCanvasX(1), toCanvasY(1), 6, 0, Math.PI * 2);
    ctx.fill();

    const cp1Size = hoveredControl === 'cp1' ? 10 : 8;
    const cp2Size = hoveredControl === 'cp2' ? 10 : 8;

    ctx.fillStyle = curve.x1 < 0 || curve.x1 > 1 ? '#ef4444' : '#f59e0b';
    ctx.beginPath();
    ctx.arc(toCanvasX(curve.x1), toCanvasY(curve.y1), cp1Size, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = curve.x2 < 0 || curve.x2 > 1 ? '#ef4444' : '#8b5cf6';
    ctx.beginPath();
    ctx.arc(toCanvasX(curve.x2), toCanvasY(curve.y2), cp2Size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px monospace';
    ctx.fillText('0', padding - 15, height - padding + 15);
    ctx.fillText('1', width - padding + 5, height - padding + 15);
    ctx.fillText('1', padding - 15, padding + 5);
  }, [curve, hoveredControl]);

  useEffect(() => {
    drawCurve();
  }, [drawCurve]);

  const getControlAtPosition = (x: number, y: number): 'cp1' | 'cp2' | null => {
    const cp1X = toCanvasX(curve.x1);
    const cp1Y = toCanvasY(curve.y1);
    const cp2X = toCanvasX(curve.x2);
    const cp2Y = toCanvasY(curve.y2);

    const dist1 = Math.sqrt((x - cp1X) ** 2 + (y - cp1Y) ** 2);
    const dist2 = Math.sqrt((x - cp2X) ** 2 + (y - cp2Y) ** 2);

    if (dist1 < 15) return 'cp1';
    if (dist2 < 15) return 'cp2';
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const control = getControlAtPosition(x, y);
    if (control) {
      setDraggingControl(control);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (draggingControl) {
      const newX = fromCanvasX(x);
      const newY = fromCanvasY(y);

      if (draggingControl === 'cp1') {
        onChange({ ...curve, x1: Math.max(-0.5, Math.min(1.5, newX)), y1: Math.max(-0.5, Math.min(1.5, newY)) });
      } else {
        onChange({ ...curve, x2: Math.max(-0.5, Math.min(1.5, newX)), y2: Math.max(-0.5, Math.min(1.5, newY)) });
      }
    } else {
      const hovered = getControlAtPosition(x, y);
      setHoveredControl(hovered);
    }
  };

  const handleMouseUp = () => {
    setDraggingControl(null);
  };

  const handleMouseLeave = () => {
    setDraggingControl(null);
    setHoveredControl(null);
  };

  const presetCurves = [
    { name: '线性', curve: { x1: 0, y1: 0, x2: 1, y2: 1 } },
    { name: '缓入', curve: { x1: 0.42, y1: 0, x2: 1, y2: 1 } },
    { name: '缓出', curve: { x1: 0, y1: 0, x2: 0.58, y2: 1 } },
    { name: '缓入缓出', curve: { x1: 0.42, y1: 0, x2: 0.58, y2: 1 } },
    { name: '弹性', curve: { x1: 0.68, y1: -0.55, x2: 0.265, y2: 1.55 } },
    { name: '弹跳', curve: { x1: 0.6, y1: 0.04, x2: 0.98, y2: 0.335 } },
  ];

  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="rounded-lg cursor-crosshair border border-white/10"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        />
      </div>

      <div className="flex-1 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 block">X1</label>
            <input
              type="number"
              step="0.01"
              value={curve.x1.toFixed(2)}
              onChange={(e) => onChange({ ...curve, x1: parseFloat(e.target.value) })}
              className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white font-mono focus:outline-none focus:border-sky-400/50"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 block">Y1</label>
            <input
              type="number"
              step="0.01"
              value={curve.y1.toFixed(2)}
              onChange={(e) => onChange({ ...curve, y1: parseFloat(e.target.value) })}
              className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white font-mono focus:outline-none focus:border-sky-400/50"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 block">X2</label>
            <input
              type="number"
              step="0.01"
              value={curve.x2.toFixed(2)}
              onChange={(e) => onChange({ ...curve, x2: parseFloat(e.target.value) })}
              className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white font-mono focus:outline-none focus:border-sky-400/50"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 block">Y2</label>
            <input
              type="number"
              step="0.01"
              value={curve.y2.toFixed(2)}
              onChange={(e) => onChange({ ...curve, y2: parseFloat(e.target.value) })}
              className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white font-mono focus:outline-none focus:border-sky-400/50"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] text-gray-500 block mb-1">预设</label>
          <div className="flex flex-wrap gap-1">
            {presetCurves.map((preset) => (
              <button
                key={preset.name}
                onClick={() => onChange(preset.curve)}
                className="px-2 py-1 text-[10px] bg-white/5 text-gray-400 rounded hover:bg-white/10 hover:text-white transition-all"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div className="p-2 bg-white/5 rounded text-[10px] text-gray-500 font-mono">
          cubic-bezier({curve.x1.toFixed(2)}, {curve.y1.toFixed(2)}, {curve.x2.toFixed(2)}, {curve.y2.toFixed(2)})
        </div>
      </div>
    </div>
  );
};

export default BezierEditor;
