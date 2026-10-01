import Link from 'next/link';
import { Sidebar } from '@/components/shared/Sidebar';
import { MobileNav } from '@/components/shared/MobileNav';
import { ChevronLeftIcon, AlertTriangleIcon, EditIcon } from '@/components/shared/icons';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getChildById } from '@/app/_actions/children';
import { ParentsSection } from '@/components/kids/ParentsSection';
import {
  calculateAgeFromISO,
  formatBirthDateDisplay,
  stringToAvatarColors,
} from '@/app/_lib/kid-utils';

export default async function KidProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const child = await getChildById(id);

  if (!child) {
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

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('name')
    .eq('id', child.room_id)
    .single();

  const roomName = roomError ? 'Sin sala' : room.name;
  const age = calculateAgeFromISO(child.birth_date);
  const birthDateDisplay = formatBirthDateDisplay(child.birth_date);
  const enrolledDisplay = formatBirthDateDisplay(child.enrolled_at);

  const hasAllergies = (child.allergy_tags || []).length > 0;
  const medicalNotes = child.medical_notes || '';

  const initial = child.full_name.charAt(0).toUpperCase();
  const colors = stringToAvatarColors(child.full_name);

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
            <div className="flex-1 min-w-[300px] flex flex-col gap-[18px]">
              <div className="flex items-center gap-[18px]">
                <div
                  className="w-[84px] h-[84px] rounded-full font-head font-semibold text-[34px] flex items-center justify-center shrink-0"
                  style={{ background: colors.bg, color: colors.color }}
                >
                  {initial}
                </div>
                <div className="flex-1">
                  <h1 className="font-head font-semibold text-[28px] text-ink m-0">
                    {child.full_name}
                  </h1>
                  <p className="m-0 mt-1 text-[15px] text-[#94887B]">
                    {age} años · Sala {roomName}
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

              {hasAllergies && medicalNotes && (
                <div className="flex gap-[14px] bg-[#FBDAD6] rounded-[16px] px-[18px] py-4">
                  <div className="w-10 h-10 rounded-[11px] bg-[#F4A8A0] flex items-center justify-center shrink-0">
                    <AlertTriangleIcon className="w-[22px] h-[22px] text-white" />
                  </div>
                  <div>
                    <div className="font-extrabold text-[#C5413A] text-[15px] mb-1">
                      Alergias y notas
                    </div>
                    <div className="text-[#B25249] text-[14.5px] leading-relaxed">
                      {medicalNotes}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-card border border-line rounded-[16px] overflow-hidden">
                <div className="flex justify-between px-[18px] py-[15px] border-b border-[#F0E6D8]">
                  <span className="text-[#94887B] text-[14.5px]">
                    Fecha de nacimiento
                  </span>
                  <span className="font-extrabold text-ink text-[14.5px]">
                    {birthDateDisplay}
                  </span>
                </div>
                <div className="flex justify-between px-[18px] py-[15px] border-b border-[#F0E6D8]">
                  <span className="text-[#94887B] text-[14.5px]">Sala</span>
                  <span className="font-extrabold text-ink text-[14.5px]">
                    {roomName}
                  </span>
                </div>
                <div className="flex justify-between px-[18px] py-[15px]">
                  <span className="text-[#94887B] text-[14.5px]">Ingreso</span>
                  <span className="font-extrabold text-ink text-[14.5px]">
                    {enrolledDisplay}
                  </span>
                </div>
              </div>
            </div>

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

              <ParentsSection kidName={child.full_name} childId={child.id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
