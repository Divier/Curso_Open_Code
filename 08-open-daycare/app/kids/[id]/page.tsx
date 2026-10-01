'use client';

import { use } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { getKidById, PARENT_STATUS_BADGE, PARENT_STATUS_LABEL, LinkedParent, kids } from '@/app/_data/kids';
import { Sidebar } from '@/components/shared/Sidebar';
import { MobileNav } from '@/components/shared/MobileNav';
import { ChevronLeftIcon, AlertTriangleIcon, EditIcon } from '@/components/shared/icons';
import { LinkParentModal } from '@/components/kids/LinkParentModal';

interface KidProfileProps {
  params: Promise<{ id: string }>;
}

export default function KidProfilePage({ params }: KidProfileProps) {
  const { id } = use(params);
  const kid = getKidById(id);
  const [showLinkParent, setShowLinkParent] = useState(false);

  const handleLinkParent = (parent: LinkedParent) => {
    const targetKid = kids.find((k) => k.id === id);
    if (targetKid) {
      targetKid.linkedParents.push(parent);
    }
  };

  if (!kid) {
    return (
      <div className="flex flex-1 min-h-screen bg-canvas">
        <Sidebar />
        <MobileNav />
        <main className="flex-1 min-w-0 h-screen overflow-y-auto">
          <div className="max-w-[820px] w-full mx-auto px-5 md:px-10 pt-16 md:pt-[34px] pb-20">
            <Link
              href="/kids"
              className="flex items-center gap-[7px] text-[#94887B] font-bold text-[14px] mb-5"
            >
              <ChevronLeftIcon className="w-[18px] h-[18px]" />
              Volver a Niños
            </Link>
            <div className="text-center py-20">
              <p className="text-[18px] text-muted font-semibold">
                Niño no encontrado
              </p>
              <Link
                href="/kids"
                className="text-accent font-bold mt-2 inline-block"
              >
                Volver a la lista
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const hasAllergies = kid.allergies.length > 0;

  return (
    <div className="flex flex-1 min-h-screen bg-canvas">
      <Sidebar pathname="/kids" />
      <MobileNav pathname="/kids" />
      <main className="flex-1 min-w-0 h-screen overflow-y-auto">
        <div className="max-w-[820px] w-full mx-auto px-5 md:px-10 pt-16 md:pt-[34px] pb-20">
          <Link
            href="/kids"
            className="flex items-center gap-[7px] text-[#94887B] font-bold text-[14px] mb-5"
          >
            <ChevronLeftIcon className="w-[18px] h-[18px]" />
            Volver a Niños
          </Link>

          <div className="flex gap-[26px] items-start flex-wrap">
            {/* Left column */}
            <div className="flex-1 min-w-[300px] flex flex-col gap-[18px]">
              {/* Header */}
              <div className="flex items-center gap-[18px]">
                <div
                  className="w-[84px] h-[84px] rounded-full font-head font-semibold text-[34px] flex items-center justify-center shrink-0"
                  style={{ background: kid.avatarBg, color: kid.avatarColor }}
                >
                  {kid.initial}
                </div>
                <div className="flex-1">
                  <h1 className="font-head font-semibold text-[28px] text-ink m-0">
                    {kid.fullName}
                  </h1>
                  <p className="m-0 mt-1 text-[15px] text-[#94887B]">
                    {kid.age} años · Sala {kid.room}
                  </p>
                </div>
                <a
                  href="#"
                  className="border border-[#ECE0D0] bg-card text-[#6E6359] font-bold text-[14px] px-4 py-[9px] rounded-[12px] flex items-center gap-2"
                >
                  <EditIcon className="w-4 h-4" />
                  Editar
                </a>
              </div>

              {/* Allergies card */}
              {hasAllergies && (
                <div className="flex gap-[14px] bg-[#FBDAD6] rounded-[16px] px-[18px] py-4">
                  <div className="w-10 h-10 rounded-[11px] bg-[#F4A8A0] flex items-center justify-center shrink-0">
                    <AlertTriangleIcon className="w-[22px] h-[22px] text-white" />
                  </div>
                  <div>
                    <div className="font-extrabold text-[#C5413A] text-[15px] mb-1">
                      Alergias y notas
                    </div>
                    <div className="text-[#B25249] text-[14.5px] leading-relaxed">
                      {kid.medicalNotes}
                    </div>
                  </div>
                </div>
              )}

              {/* Data table */}
              <div className="bg-card border border-line rounded-[16px] overflow-hidden">
                <div className="flex justify-between px-[18px] py-[15px] border-b border-[#F0E6D8]">
                  <span className="text-[#94887B] text-[14.5px]">
                    Fecha de nacimiento
                  </span>
                  <span className="font-extrabold text-ink text-[14.5px]">
                    {kid.birthDate}
                  </span>
                </div>
                <div className="flex justify-between px-[18px] py-[15px] border-b border-[#F0E6D8]">
                  <span className="text-[#94887B] text-[14.5px]">Sala</span>
                  <span className="font-extrabold text-ink text-[14.5px]">
                    {kid.room}
                  </span>
                </div>
                <div className="flex justify-between px-[18px] py-[15px]">
                  <span className="text-[#94887B] text-[14.5px]">Ingreso</span>
                  <span className="font-extrabold text-ink text-[14.5px]">
                    {kid.enrollmentDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="w-[300px] shrink-0 flex flex-col gap-[14px]">
              <a
                href="#"
                className="flex items-center justify-center gap-[9px] w-full px-[13px] py-[13px] rounded-[14px] bg-[#3F362E] text-white font-extrabold text-[15px]"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </svg>
                Resumen del día
              </a>

              <div className="bg-card border border-line rounded-[16px] px-[18px] py-4">
                <div className="text-[12.5px] font-extrabold tracking-[0.8px] text-[#8A7C6D] mb-[14px]">
                  PADRES VINCULADOS
                </div>
                <div className="flex flex-col gap-[14px]">
                  {kid.linkedParents.map((parent, i) => (
                    <div key={i} className="flex items-center gap-[12px]">
                      <div
                        className="w-10 h-10 rounded-full font-head font-semibold text-[16px] flex items-center justify-center shrink-0"
                        style={{
                          background: parent.avatarBg,
                          color: parent.avatarColor,
                        }}
                      >
                        {parent.initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-extrabold text-[14.5px] text-ink truncate">
                          {parent.name}
                        </div>
                        <div className="text-[12.5px] text-muted">
                          {parent.role} ·{' '}
                          {parent.status === 'active'
                            ? 'activa'
                            : 'invitación enviada'}
                        </div>
                      </div>
                      <span
                        className="flex-none text-[10.5px] font-extrabold px-[9px] py-1 rounded-full"
                        style={{
                          background: PARENT_STATUS_BADGE[parent.status].bg,
                          color: PARENT_STATUS_BADGE[parent.status].color,
                        }}
                      >
                        {PARENT_STATUS_LABEL[parent.status]}
                      </span>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowLinkParent(true)}
                    className="flex items-center gap-[12px] pt-2 bg-none border-none cursor-pointer p-0"
                  >
                    <span className="w-10 h-10 rounded-full border-[1.5px] border-dashed border-[#D8CBBA] flex items-center justify-center text-[#B0A290]">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                    <span className="font-extrabold text-[14.5px] text-[#C5503A]">
                      Vincular otro padre
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <LinkParentModal
        open={showLinkParent}
        kidName={kid.fullName}
        onClose={() => setShowLinkParent(false)}
        onLink={handleLinkParent}
      />
    </div>
  );
}
