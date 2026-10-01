'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  NEW_POST_TYPE_LABEL,
  NEW_POST_TYPE_COLORS,
  getNewPostTargets,
  type NewPostType,
  type NewPostTarget,
} from '@/app/_data/newPost';
import { PhotoIcon, PlusIcon } from '@/components/shared/icons';

interface NewPostModalProps {
  open: boolean;
  onClose: () => void;
  onPublish: () => void;
}

export function NewPostModal({ open, onClose, onPublish }: NewPostModalProps) {
  const targets = getNewPostTargets();

  const [selectedTargets, setSelectedTargets] = useState<NewPostTarget[]>([]);
  const [selectedType, setSelectedType] = useState<NewPostType | null>(null);
  const [description, setDescription] = useState('');

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [open, handleKeyDown]);

  const toggleTarget = (target: NewPostTarget) => {
    setSelectedTargets((prev) => {
      if (target.type === 'all') {
        if (prev.some((t) => t.type === 'all')) {
          return prev.filter((t) => t.type !== 'all');
        }
        return [{ type: 'all', label: target.label }];
      }
      const isKidSelected = prev.some(
        (t) => t.type === 'kid' && t.id === target.id,
      );
      const filtered = prev.filter(
        (t) => t.type !== 'all' && !(t.type === 'kid' && t.id === target.id),
      );
      if (!isKidSelected) {
        return [...filtered, target];
      }
      return filtered;
    });
  };

  const handlePublish = () => {
    if (selectedTargets.length > 0 && selectedType && description.trim()) {
      onPublish();
      resetForm();
    }
  };

  const resetForm = () => {
    setSelectedTargets([]);
    setSelectedType(null);
    setDescription('');
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-[580px] rounded-[24px] border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,.35)]"
        style={{ overflow: 'hidden' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ECE0D0] px-[26px] py-5">
          <button
            type="button"
            onClick={onClose}
            className="text-[15px] font-bold text-[#94887B] hover:text-[#7A6E64]"
          >
            Cancelar
          </button>
          <span className="font-head text-[18px] font-semibold text-[#3F362E]">
            Nueva publicación
          </span>
          <button
            type="button"
            onClick={handlePublish}
            className="text-[15px] font-extrabold text-[#D9583C] hover:text-[#C44A2E]"
          >
            Publicar
          </button>
        </div>

        {/* Body */}
        <div className="px-[26px] py-6">
          {/* PARA */}
          <div className="mb-2.5 text-[12px] font-extrabold tracking-[.7px] text-[#94887B]">
            PARA
          </div>
          <div className="mb-[22px] flex flex-wrap gap-[9px]">
            {targets.map((target) => {
              const isSelected = selectedTargets.some(
                (t) => {
                  if (t.type === 'all' && target.type === 'all') return true;
                  if (t.type === 'kid' && target.type === 'kid')
                    return t.id === target.id;
                  return false;
                },
              );

              if (target.type === 'kid') {
                return (
                  <button
                    key={target.id}
                    type="button"
                    onClick={() => toggleTarget(target)}
                    className="flex items-center gap-2 rounded-full px-2.5 py-1.5 text-[14px] font-bold transition-colors"
                    style={
                      isSelected
                        ? {
                            border: '1.5px solid #3F362E',
                            background: '#3F362E',
                            color: '#fff',
                          }
                        : {
                            border: '1.5px solid #ECE0D0',
                            background: '#FFFDF9',
                            color: '#6E6359',
                          }
                    }
                  >
                    <span
                      className="flex h-[26px] w-[26px] items-center justify-center rounded-full font-head text-[13px] font-semibold"
                      style={{
                        background: target.avatarBg,
                        color: target.avatarColor,
                      }}
                    >
                      {target.initial}
                    </span>
                    {target.name.split(' ')[0]}
                  </button>
                );
              }

              return (
                <button
                  key="all"
                  type="button"
                  onClick={() => toggleTarget(target)}
                  className="rounded-full px-4 py-1.5 text-[14px] font-bold transition-colors"
                  style={
                    isSelected
                      ? {
                          border: '1.5px solid #3F362E',
                          background: '#3F362E',
                          color: '#fff',
                        }
                      : {
                          border: '1.5px solid #ECE0D0',
                          background: '#FFFDF9',
                          color: '#6E6359',
                        }
                  }
                >
                  {target.label}
                </button>
              );
            })}
          </div>

          {/* TIPO */}
          <div className="mb-2.5 text-[12px] font-extrabold tracking-[.7px] text-[#94887B]">
            TIPO
          </div>
          <div className="mb-[22px] flex flex-wrap gap-[9px]">
            {(Object.keys(NEW_POST_TYPE_LABEL) as NewPostType[]).map((type) => {
              const isSelected = selectedType === type;
              const colors = NEW_POST_TYPE_COLORS[type];
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className="rounded-full px-4 py-2 text-[13.5px] font-extrabold transition-opacity"
                  style={{
                    background: colors.bg,
                    color: colors.text,
                    opacity: isSelected ? 1 : 0.7,
                  }}
                >
                  {NEW_POST_TYPE_LABEL[type]}
                </button>
              );
            })}
          </div>

          {/* DESCRIPCIÓN */}
          <div className="mb-2.5 text-[12px] font-extrabold tracking-[.7px] text-[#94887B]">
            DESCRIPCIÓN
          </div>
          <textarea
            placeholder="Contá cómo le fue hoy…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mb-[22px] w-full resize-y rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-3.5 text-[15px] leading-relaxed text-[#3F362E] placeholder:text-[#B6A99B]"
            style={{ minHeight: '120px' }}
          />

          {/* FOTOS */}
          <div className="mb-2.5 text-[12px] font-extrabold tracking-[.7px] text-[#94887B]">
            FOTOS
          </div>
          <div className="flex gap-3">
            <div
              className="flex h-[96px] w-[96px] items-center justify-center rounded-[14px] border border-[#ECE0D0]"
              style={{ background: '#F4ECE1', color: '#CBB89F' }}
            >
              <PhotoIcon width={26} height={26} />
            </div>
            <button
              type="button"
              className="flex h-[96px] w-[96px] flex-col items-center justify-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed"
              style={{
                background: '#F4ECE1',
                borderColor: '#DBCDBA',
                color: '#B0A290',
              }}
            >
              <PlusIcon width={22} height={22} style={{ color: '#C5503A' }} />
              <span className="text-[12px]">Agregar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
