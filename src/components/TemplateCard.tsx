import React, { useMemo } from 'react';
import { Heart, Check } from 'lucide-react';
import { SVGAnimationTemplate, AnimationParams } from '@/types';
import { useAppStore } from '@/store/useAppStore';

interface TemplateCardProps {
  template: SVGAnimationTemplate;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
  const { selectedTemplateId, selectTemplate, currentParams, favorites, toggleFavorite } = useAppStore();

  const isSelected = selectedTemplateId === template.id;
  const isFavorite = favorites.some(
    f => f.templateId === template.id && JSON.stringify(f.params) === JSON.stringify(currentParams)
  );

  const previewSvg = useMemo(() => {
    return template.generate(template.defaultParams);
  }, [template]);

  const handleClick = () => {
    selectTemplate(template.id);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(template.id, template.defaultParams);
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-300 ${
        isSelected
          ? 'bg-sky-500/10 border-2 border-sky-400 shadow-lg shadow-sky-500/20'
          : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
      }`}
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleFavoriteClick}
          className={`p-1.5 rounded-lg transition-all ${
            isFavorite
              ? 'bg-pink-500/20 text-pink-400'
              : 'bg-white/5 text-gray-400 hover:text-pink-400 hover:bg-white/10'
          }`}
        >
          {isFavorite ? (
            <Check className="w-4 h-4" />
          ) : (
            <Heart className="w-4 h-4" />
          )}
        </button>
      </div>

      <div
        className="h-24 flex items-center justify-center mb-3 bg-slate-900/50 rounded-lg"
        dangerouslySetInnerHTML={{ __html: previewSvg }}
      />

      <h3 className="text-sm font-semibold text-white truncate">{template.name}</h3>
      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{template.description}</p>

      {isSelected && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-sky-400 rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-slate-900" />
        </div>
      )}
    </div>
  );
};

export default TemplateCard;
