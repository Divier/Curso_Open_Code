'use client';

import { useState, useEffect, useRef } from 'react';
import {
  NEW_POST_TYPE_LABEL,
  NEW_POST_TYPE_COLORS,
  getNewPostTargets,
  type NewPostType,
  type NewPostTarget,
} from '@/app/_data/newPost';
import {
  createPost,
  type CreatePostResult,
} from '@/app/_actions/createPost';
import {
  MAX_IMAGES,
  validateImage,
} from '@/app/_data/posts';
import { PhotoIcon, PlusIcon, CloseIcon } from '@/components/shared/icons';

interface NewPostModalProps {
  open: boolean;
  onClose: () => void;
  onPublish: () => void;
  userRole?: 'staff' | 'admin' | 'parent';
  realChildren?: { id: string; full_name: string }[];
}

export function NewPostModal({
  open,
  onClose,
  onPublish,
  userRole = 'staff',
  realChildren,
}: NewPostModalProps) {
  const targets = getNewPostTargets(realChildren);

  const [selectedTargets, setSelectedTargets] = useState<NewPostTarget[]>([]);
  const [selectedType, setSelectedType] = useState<NewPostType | null>(null);
  const [description, setDescription] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  useEffect(() => {
    if (open) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isSubmitting) {
          onClose();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [open, isSubmitting, onClose]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remaining = MAX_IMAGES - selectedImages.length;
    const toAdd = files.slice(0, remaining);

    const errors: string[] = [];
    const validFiles: File[] = [];
    const validUrls: string[] = [];

    for (const file of toAdd) {
      const result = validateImage(file);
      if (!result.valid) {
        errors.push(result.error!);
      } else {
        validFiles.push(file);
        validUrls.push(URL.createObjectURL(file));
      }
    }

    if (validFiles.length > 0) {
      setSelectedImages((prev) => [...prev, ...validFiles]);
      setPreviewUrls((prev) => [...prev, ...validUrls]);
    }

    if (errors.length > 0) {
      setError(errors[0]);
    }

    if (e.target) {
      e.target.value = '';
    }
  };

  const handleAddImages = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (isSubmitting) return;
    if (!selectedType || !description.trim()) return;

    const hasAllTarget = selectedTargets.some((t) => t.type === 'all');
    const kidTarget = selectedTargets.find((t) => t.type === 'kid');

    setIsSubmitting(true);
    setError(null);

    try {
      const result: CreatePostResult = await createPost({
        postType: selectedType,
        description: description.trim(),
        targetType: hasAllTarget ? 'all' : 'kid',
        targetChildId: kidTarget?.type === 'kid' ? kidTarget.id : undefined,
        images: selectedImages.length > 0 ? selectedImages : undefined,
      });

      if (result.success) {
        onPublish();
        resetForm();
        onClose();
      } else {
        setError(result.error || 'Error al crear la publicación');
      }
    } catch {
      setError('Error inesperado al crear la publicación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedTargets([]);
    setSelectedType(null);
    setDescription('');
    setSelectedImages([]);
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setError(null);
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  if (userRole !== 'staff' && userRole !== 'admin') {
    return null;
  }

  const canPublish =
    selectedType !== null &&
    description.trim().length > 0 &&
    !isSubmitting;

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
            disabled={isSubmitting}
            className="text-[15px] font-bold text-[#94887B] hover:text-[#7A6E64] disabled:opacity-50"
          >
            Cancelar
          </button>
          <span className="font-head text-[18px] font-semibold text-[#3F362E]">
            Nueva publicación
          </span>
          <button
            type="button"
            onClick={handlePublish}
            disabled={!canPublish}
            className="text-[15px] font-extrabold text-[#D9583C] hover:text-[#C44A2E] disabled:opacity-50"
          >
            {isSubmitting ? 'Publicando...' : 'Publicar'}
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
              const isSelected = selectedTargets.some((t) => {
                if (t.type === 'all' && target.type === 'all') return true;
                if (t.type === 'kid' && target.type === 'kid')
                  return t.id === target.id;
                return false;
              });

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
            disabled={isSubmitting}
            className="mb-[22px] w-full resize-y rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-3.5 text-[15px] leading-relaxed text-[#3F362E] placeholder:text-[#B6A99B] disabled:opacity-60"
            style={{ minHeight: '120px' }}
          />

          {/* FOTOS */}
          <div className="mb-2.5 text-[12px] font-extrabold tracking-[.7px] text-[#94887B]">
            FOTOS
            {selectedImages.length > 0 && (
              <span className="ml-2 font-normal text-[#6E6359]">
                ({selectedImages.length}/{MAX_IMAGES})
              </span>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex flex-wrap gap-3">
            {/* Placeholder */}
            <div
              className="flex h-[96px] w-[96px] items-center justify-center rounded-[14px] border border-[#ECE0D0]"
              style={{ background: '#F4ECE1', color: '#CBB89F' }}
            >
              <PhotoIcon width={26} height={26} />
            </div>

            {/* Add button */}
            {selectedImages.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={handleAddImages}
                disabled={isSubmitting}
                className="flex h-[96px] w-[96px] flex-col items-center justify-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed disabled:opacity-50"
                style={{
                  background: '#F4ECE1',
                  borderColor: '#DBCDBA',
                  color: '#B0A290',
                }}
              >
                <PlusIcon width={22} height={22} style={{ color: '#C5503A' }} />
                <span className="text-[12px]">Agregar</span>
              </button>
            )}

            {/* Previews */}
            {previewUrls.map((url, index) => (
              <div
                key={url}
                className="relative h-[96px] w-[96px] rounded-[14px] overflow-hidden border border-[#ECE0D0]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  disabled={isSubmitting}
                  className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 disabled:opacity-50"
                >
                  <CloseIcon width={12} height={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 rounded-[10px] bg-[#FDE8E0] px-4 py-3 text-[13px] text-[#C5503A]">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
