'use client';

import { useState } from 'react';
import type { Room, Child } from '@/app/_actions/children';
import { KidCard } from '@/components/kids/KidCard';
import { AddKidModal } from '@/components/kids/AddKidModal';
import { SearchIcon } from '@/components/shared/icons';

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

interface KidsPageClientProps {
  groupedData: { room: Room; children: Child[] }[];
  rooms: Room[];
  daycareId: string;
}

export function KidsPageClient({ groupedData, rooms }: KidsPageClientProps) {
  const [query, setQuery] = useState('');
  const [showAddKid, setShowAddKid] = useState(false);

  const filteredGroups = groupedData.map((group) => ({
    room: group.room,
    children: group.children.filter((child) =>
      normalize(child.full_name).includes(normalize(query)),
    ),
  }));

  const handleAddKid = () => {
    setShowAddKid(false);
  };

  return (
    <>
      <div className="flex items-end justify-between gap-4 mb-[22px]">
        <div>
          <div className="text-[12.5px] font-extrabold tracking-[0.8px] text-accent mb-1">
            GESTIÓN
          </div>
          <h1 className="font-head font-semibold text-[30px] text-ink m-0">
            Niños
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setShowAddKid(true)}
          className="flex items-center gap-2 px-[18px] py-[11px] rounded-[14px] bg-gradient-to-b from-[#F4977E] to-[#EE8164] text-white font-extrabold text-[14.5px] shadow-[0_8px_18px_-8px_rgba(238,129,100,0.7)]"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Agregar niño
        </button>
      </div>

      <div className="flex items-center gap-[11px] bg-card border border-line rounded-[14px] px-4 py-3 mb-[22px]">
        <SearchIcon className="w-[18px] h-[18px] text-[#B0A290]" />
        <input
          placeholder="Buscar niño…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border-none bg-none text-[15px] text-ink placeholder-[#B6A99999] outline-none"
        />
      </div>

      {filteredGroups.map(
        ({ room, children }) =>
          children.length > 0 && (
            <div key={room.id} className="mb-6">
              <div className="flex items-center gap-3 mb-[14px]">
                <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-ink">
                  SALA {room.name.toUpperCase()}
                </span>
                <span className="text-[13px] text-muted">
                  {children.length} niño{children.length !== 1 ? 's' : ''}
                </span>
                <span className="flex-1 h-px bg-[#E7DAC8]" />
              </div>

              <div className="grid grid-cols-2 gap-[14px]">
                {children.map((child) => (
                  <KidCard key={child.id} child={child} />
                ))}
              </div>
            </div>
          ),
      )}

      {filteredGroups.every((g) => g.children.length === 0) && (
        <div className="text-center py-12 text-muted">
          {query
            ? 'No se encontraron niños con ese nombre'
            : 'No hay niños registrados'}
        </div>
      )}

      <AddKidModal
        open={showAddKid}
        onClose={() => setShowAddKid(false)}
        onAdd={handleAddKid}
        rooms={rooms}
      />
    </>
  );
}
