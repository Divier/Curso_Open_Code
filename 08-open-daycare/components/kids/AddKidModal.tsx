'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Kid,
  generateKidId,
  calculateAge,
  formatBirthDateDisplay,
  parseAllergyText,
  randomAvatarBg,
  randomAvatarColor,
  isValidDate,
} from '@/app/_data/kids';

const ROOMS = ['Soles', 'Estrellas', 'Arcoíris'];

interface AddKidModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (kid: Kid) => void;
}

export function AddKidModal({ open, onClose, onAdd }: AddKidModalProps) {
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [room, setRoom] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');

  const [nameError, setNameError] = useState('');
  const [dateError, setDateError] = useState('');
  const [roomError, setRoomError] = useState('');

  const handleDateChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    let formatted = '';
    for (let i = 0; i < digits.length; i++) {
      if (i === 2 || i === 4) formatted += '/';
      formatted += digits[i];
    }
    setBirthDate(formatted);
  };

  const handleSave = () => {
    let valid = true;
    setNameError('');
    setDateError('');
    setRoomError('');

    if (!fullName.trim()) {
      setNameError('El nombre es obligatorio');
      valid = false;
    }

    if (birthDate.length < 10 || !isValidDate(birthDate)) {
      setDateError(
        birthDate.length < 10
          ? 'La fecha debe estar completa (dd/mm/aaaa)'
          : 'La fecha no es válida',
      );
      valid = false;
    }

    if (!room) {
      setRoomError('Debes seleccionar una sala');
      valid = false;
    }

    if (!valid) return;

    const newKid: Kid = {
      id: generateKidId(fullName),
      firstName: fullName.trim().split(' ')[0],
      lastName: fullName.trim().split(' ').slice(1).join(' '),
      fullName: fullName.trim(),
      initial: fullName.trim().charAt(0).toUpperCase(),
      age: calculateAge(birthDate),
      room,
      birthDate: formatBirthDateDisplay(birthDate),
      enrollmentDate: (() => {
        const now = new Date();
        const months = [
          'ene',
          'feb',
          'mar',
          'abr',
          'may',
          'jun',
          'jul',
          'ago',
          'sep',
          'oct',
          'nov',
          'dic',
        ];
        return `${months[now.getMonth()]} ${now.getFullYear()}`;
      })(),
      allergies: parseAllergyText(allergies),
      medicalNotes: medicalNotes.trim(),
      linkedParents: [],
      avatarBg: randomAvatarBg(),
      avatarColor: randomAvatarColor(),
    };

    onAdd(newKid);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFullName('');
    setBirthDate('');
    setRoom('');
    setAllergies('');
    setMedicalNotes('');
    setNameError('');
    setDateError('');
    setRoomError('');
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-[520px] rounded-[24px] border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,.35)]"
        style={{ overflow: 'hidden' }}
      >
        <div className="flex items-center justify-between border-b border-[#ECE0D0] px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="text-[15px] font-bold text-[#94887B] hover:text-[#7A6E64]"
          >
            Cancelar
          </button>
          <span className="font-fredoka text-[18px] font-semibold text-[#3F362E]">
            Agregar ni&ntilde;o
          </span>
          <button
            type="button"
            onClick={handleSave}
            className="text-[15px] font-extrabold text-[#D9583C] hover:text-[#C44A2E]"
          >
            Guardar
          </button>
        </div>

        <div className="px-6 py-6">
          <label className="mb-2 block text-[12px] font-extrabold tracking-wide text-[#94887B]">
            NOMBRE COMPLETO
          </label>
          <input
            type="text"
            placeholder="Ej. Martina L&oacute;pez"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mb-1 w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-3 text-[15px] text-[#3F362E] placeholder:text-[#B6A99B]"
          />
          {nameError && (
            <p className="mb-4 text-[13px] font-medium text-[#D9583C]">
              {nameError}
            </p>
          )}

          <div className="mb-1 flex gap-[14px]">
            <div className="flex-1">
              <label className="mb-2 block text-[12px] font-extrabold tracking-wide text-[#94887B]">
                FECHA DE NACIMIENTO
              </label>
              <input
                type="text"
                placeholder="dd/mm/aaaa"
                value={birthDate}
                onChange={(e) => handleDateChange(e.target.value)}
                maxLength={10}
                className="w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-3 text-[15px] text-[#3F362E] placeholder:text-[#B6A99B]"
              />
              {dateError && (
                <p className="mt-1 text-[13px] font-medium text-[#D9583C]">
                  {dateError}
                </p>
              )}
            </div>

            <div className="flex-1">
              <label className="mb-2 block text-[12px] font-extrabold tracking-wide text-[#94887B]">
                SALA
              </label>
              <div className="relative">
                <select
                  value={room}
                  onChange={(e) => {
                    setRoom(e.target.value);
                    setRoomError('');
                  }}
                  className="w-full appearance-none rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-3 pr-10 text-[15px] font-bold text-[#3F362E]"
                >
                  <option value="" disabled>
                    Seleccionar sala
                  </option>
                  {ROOMS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#B0A290"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
              {roomError && (
                <p className="mt-1 text-[13px] font-medium text-[#D9583C]">
                  {roomError}
                </p>
              )}
            </div>
          </div>

          <label className="mb-2 mt-4 block text-[12px] font-extrabold tracking-wide text-[#94887B]">
            ALERGIAS (ETIQUETAS)
          </label>
          <input
            type="text"
            placeholder="Ej. Man&iacute;, Lactosa"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            className="mb-1 w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-3 text-[15px] text-[#3F362E] placeholder:text-[#B6A99B]"
          />

          <label className="mb-2 mt-4 block text-[12px] font-extrabold tracking-wide text-[#94887B]">
            NOTAS M&Eacute;DICAS
          </label>
          <textarea
            placeholder="Indicaciones, medicaci&oacute;n, contactos&hellip;"
            value={medicalNotes}
            onChange={(e) => setMedicalNotes(e.target.value)}
            className="w-full resize-y rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-3 text-[15px] leading-relaxed text-[#3F362E] placeholder:text-[#B6A99B]"
            style={{ minHeight: '90px' }}
          />
        </div>
      </div>
    </div>
  );
}
