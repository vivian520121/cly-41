import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Code, RefreshCw, Copy, Check, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const CodeEditor: React.FC = () => {
  const { svgCode, setSvgCode, addToast, isCustomCode, generateSVG, selectedTemplateId, setIsCustomCode } = useAppStore();
  const [localCode, setLocalCode] = useState(svgCode);
  const [isValid, setIsValid] = useState(true);
  const [copied, setCopied] = useState(false);
  
  const lastSystemSvgCode = useRef(svgCode);
  const debounceTimer = useRef<number | null>(null);
  const isUserEditing = useRef(false);

  useEffect(() => {
    if (svgCode !== lastSystemSvgCode.current) {
      lastSystemSvgCode.current = svgCode;
      isUserEditing.current = false;
      setLocalCode(svgCode);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
    }
  }, [svgCode, selectedTemplateId]);

  const applyUserCode = useCallback((code: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(code, 'image/svg+xml');
      const errorNode = doc.querySelector('parsererror');
      if (errorNode) {
        setIsValid(false);
      } else {
        setIsValid(true);
        lastSystemSvgCode.current = code;
        setSvgCode(code);
      }
    } catch {
      setIsValid(false);
    }
  }, [setSvgCode]);

  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    isUserEditing.current = true;
    setLocalCode(newCode);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = window.setTimeout(() => {
      if (isUserEditing.current && newCode !== lastSystemSvgCode.current) {
        applyUserCode(newCode);
      }
      debounceTimer.current = null;
    }, 300);
  }, [applyUserCode]);

  const handleReset = useCallback(() => {
    isUserEditing.current = false;
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    setIsCustomCode(false);
    generateSVG();
    addToast('代码已重置', 'info');
  }, [generateSVG, addToast, setIsCustomCode]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(localCode);
      setCopied(true);
      addToast('代码已复制到剪贴板', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast('复制失败', 'error');
    }
  }, [localCode, addToast]);

  const handleFormat = useCallback(() => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(localCode, 'image/svg+xml');
      const errorNode = doc.querySelector('parsererror');
      if (errorNode) {
        addToast('SVG代码无效，无法格式化', 'error');
        return;
      }
      
      const serializer = new XMLSerializer();
      let formatted = serializer.serializeToString(doc.documentElement);
      formatted = formatted
        .replace(/></g, '>\n<')
        .split('\n')
        .map((line, i, arr) => {
          if (i === 0) return line;
          const openTags = (line.match(/<[^/][^>]*[^/]>/g) || []).length;
          const closeTags = (line.match(/<\/[^>]+>/g) || []).length;
          const selfClosing = (line.match(/<[^>]+\/>/g) || []).length;
          const depth = arr.slice(0, i).reduce((acc, l) => {
            const opens = (l.match(/<[^/][^>]*[^/]>/g) || []).length;
            const closes = (l.match(/<\/[^>]+>/g) || []).length;
            const self = (l.match(/<[^>]+\/>/g) || []).length;
            return acc + opens - closes - self;
          }, 0);
          return '  '.repeat(Math.max(0, depth)) + line.trim();
        })
        .join('\n');
      
      setLocalCode(formatted);
      if (isUserEditing.current) {
        applyUserCode(formatted);
      }
      addToast('代码已格式化', 'success');
    } catch {
      addToast('格式化失败', 'error');
    }
  }, [localCode, addToast, applyUserCode]);

  const lineNumbers = localCode.split('\n').map((_, i) => i + 1);

  return (
    <div className="bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-sky-400" />
          <h2 className="text-lg font-semibold text-white">SVG 代码</h2>
          {isCustomCode && (
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
              自定义
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isValid && (
            <div className="flex items-center gap-1 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4" />
              <span>代码无效</span>
            </div>
          )}
          <button
            onClick={handleFormat}
            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            title="格式化代码"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            title="重置为模板代码"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            title="复制代码"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="relative h-[300px] overflow-hidden">
        <div className="absolute inset-0 flex">
          <div className="w-12 flex-shrink-0 bg-slate-950/50 border-r border-white/5 py-3 text-right pr-3 overflow-hidden select-none">
            {lineNumbers.map((num) => (
              <div key={num} className="text-xs text-gray-600 font-mono leading-6 h-6">
                {num}
              </div>
            ))}
          </div>

          <div className="flex-1 relative">
            <textarea
              value={localCode}
              onChange={handleCodeChange}
              spellCheck={false}
              className={`absolute inset-0 w-full h-full p-3 bg-transparent text-sm font-mono leading-6 resize-none focus:outline-none ${
                isValid ? 'text-gray-300' : 'text-red-400'
              } placeholder-gray-600`}
              placeholder="在此编辑SVG代码..."
            />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none" />
      </div>

      <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
        <span>{localCode.split('\n').length} 行</span>
        <span>{localCode.length} 字符</span>
      </div>
    </div>
  );
};

export default CodeEditor;
