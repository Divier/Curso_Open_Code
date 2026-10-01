'use client';

import { useState, useEffect, useCallback } from 'react';
import { CloseIcon } from '@/components/shared/icons';
import {
  LinkedParent,
  ParentStatus,
  randomAvatarBg,
  randomAvatarColor,
  isValidEmail,
} from '@/app/_data/kids';

interface LinkParentModalProps {
  open: boolean;
  kidName: string;
  onClose: () => void;
  onLink: (parent: LinkedParent) => void;
}

const ROLES = ['Mamá', 'Papá', 'Tutor/a'] as const;

export function LinkParentModal({
  open,
  kidName,
  onClose,
  onLink,
}: LinkParentModalProps) {
  const [parentName, setParentName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>('Mamá');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [roleError, setRoleError] = useState('');

  const handleSubmit = () => {
    let valid = true;
    setNameError('');
    setEmailError('');
    setRoleError('');

    if (!parentName.trim()) {
      setNameError('El nombre es obligatorio');
      valid = false;
    }

    if (!email.trim()) {
      setEmailError('El email es obligatorio');
      valid = false;
    } else if (!isValidEmail(email.trim())) {
      setEmailError('El email no tiene un formato válido');
      valid = false;
    }

    if (!role) {
      setRoleError('Debes seleccionar un parentesco');
      valid = false;
    }

    if (!valid) return;

    const newParent: LinkedParent = {
      name: parentName.trim(),
      initial: parentName.trim().charAt(0).toUpperCase(),
      role,
      status: 'pending' as ParentStatus,
      avatarBg: randomAvatarBg(),
      avatarColor: randomAvatarColor(),
    };

    onLink(newParent);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setParentName('');
    setEmail('');
    setRole('Mamá');
    setNameError('');
    setEmailError('');
    setRoleError('');
  };

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

  if (!open) return null;

  const firstName = kidName.split(' ')[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-[480px] rounded-[24px] border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,.35)]"
        style={{ overflow: 'hidden' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ECE0D0] px-6 py-5">
          <div>
            <div className="font-head font-semibold text-[18px] text-[#3F362E]">
              Vincular padre
            </div>
            <div className="text-[13px] text-[#A89A8B]">a {kidName}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[#F0E6D8] text-[#94887B] hover:text-[#7A6E64]"
          >
            <CloseIcon className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Info banner */}
          <div className="mb-5 flex gap-[11px] rounded-[14px] bg-[#E3ECFB] px-4 py-3">
            <svg
              className="mt-0.5 h-5 w-5 flex-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4E72C8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <span className="text-[13.5px] leading-[1.45] text-[#3F5694]">
              Le enviaremos un correo con un código para que active su cuenta.
              Solo verá el feed de {firstName}.
            </span>
          </div>

          {/* Parent name */}
          <div className="mb-2 text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
            NOMBRE DEL PADRE/MADRE
          </div>
          <input
            type="text"
            placeholder="Ej. Diego Fernández"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            className="mb-1 w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-3 text-[15px] text-[#3F362E] placeholder:text-[#B6A99B]"
          />
          {nameError && (
            <p className="mb-4 text-[13px] font-medium text-[#D9583C]">
              {nameError}
            </p>
          )}

          {/* Email */}
          <div className="mb-2 mt-4 text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
            EMAIL
          </div>
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-1 w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-3 text-[15px] text-[#3F362E] placeholder:text-[#B6A99B]"
          />
          {emailError && (
            <p className="mb-4 text-[13px] font-medium text-[#D9583C]">
              {emailError}
            </p>
          )}

          {/* Role toggle */}
          <div className="mb-2 mt-4 text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
            PARENTESCO
          </div>
          <div className="mb-5 flex gap-[9px]">
            {ROLES.map((r) => {
              const isSelected = role === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRole(r);
                    setRoleError('');
                  }}
                  className="flex-1 rounded-full border-[1.5px] px-3 py-[11px] text-[14px] font-extrabold"
                  style={{
                    background: isSelected ? '#CCD8F4' : '#FFFDF9',
                    borderColor: isSelected ? '#9FB8EC' : '#ECE0D0',
                    color: isSelected ? '#4E72C8' : '#6E6359',
                  }}
                >
                  {r}
                </button>
              );
            })}
          </div>
          {roleError && (
            <p className="-mt-4 mb-4 text-[13px] font-medium text-[#D9583C]">
              {roleError}
            </p>
          )}

          {/* Invitation code */}
          <div className="mb-5 rounded-[16px] border-[1.5px] border-dashed border-[#E6D08A] bg-[#FBF1D6] px-5 py-4 text-center">
            <div className="mb-2 text-[12px] font-extrabold tracking-[0.7px] text-[#A88526]">
              CÓDIGO DE INVITACIÓN
            </div>
            <div className="font-head text-[34px] font-semibold tracking-[7px] text-[#8A7234]">
              7K4P9
            </div>
            <div className="mt-1.5 text-[13px] text-[#A88526]">
              Vence en 7 días
            </div>
          </div>

          {/* Submit button */}
          <button
            type="button"
            onClick={handleSubmit}
            className="flex w-full items-center justify-center gap-[9px] rounded-[14px] bg-gradient-to-b from-[#F4977E] to-[#EE8164] px-4 py-[14px] font-extrabold text-[15.5px] text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,.7)]"
          >
            <svg
              className="h-[19px] w-[19px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m22 2-7 20-4-9-9-4z" />
              <path d="M22 2 11 13" />
            </svg>
            Enviar invitación
          </button>
        </div>
      </div>
    </div>
  );
}
