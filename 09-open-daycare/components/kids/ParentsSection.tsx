'use client';

import { useState, useEffect } from 'react';
import { LinkParentModal } from '@/components/kids/LinkParentModal';
import { getParentsByChild, getPendingInvitationsByChild, type ParentChild } from '@/app/_actions/invitations';

interface ParentsSectionProps {
  kidName: string;
  childId: string;
}

const RELATIONSHIP_LABELS: Record<string, string> = {
  father: 'Papá',
  mother: 'Mamá',
  guardian: 'Tutor/a',
};

const AVATAR_COLORS = [
  { bg: '#E3ECFB', color: '#4E72C8' },
  { bg: '#FBE3E3', color: '#C84E4E' },
  { bg: '#E3FBE8', color: '#4EC86A' },
  { bg: '#FBE3F5', color: '#C84EB0' },
  { bg: '#FBF1D6', color: '#A88526' },
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function ParentsSection({ kidName, childId }: ParentsSectionProps) {
  const [showLinkParent, setShowLinkParent] = useState(false);
  const [parents, setParents] = useState<ParentChild[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<
    { id: string; full_name: string; email: string; relationship: string; code: string; expires_at: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [parentsData, pendingData] = await Promise.all([
          getParentsByChild(childId),
          getPendingInvitationsByChild(childId),
        ]);
        if (cancelled) return;
        setParents(parentsData);
        setPendingInvitations(pendingData);
      } catch {
        if (cancelled) return;
        setParents([]);
        setPendingInvitations([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();

    return () => {
      cancelled = true;
    };
  }, [childId]);

  const handleSuccess = async () => {
    try {
      const [parentsData, pendingData] = await Promise.all([
        getParentsByChild(childId),
        getPendingInvitationsByChild(childId),
      ]);
      setParents(parentsData);
      setPendingInvitations(pendingData);
    } catch {
      // ignore
    }
  };

  return (
    <>
      <div className="bg-card border border-line rounded-[16px] px-[18px] py-4">
        <div className="text-[12.5px] font-extrabold tracking-[0.8px] text-[#8A7C6D] mb-[14px]">
          PADRES VINCULADOS
        </div>

        {loading ? (
          <div className="text-[14px] text-muted text-center py-4">Cargando...</div>
        ) : parents.length === 0 && pendingInvitations.length === 0 ? (
          <div className="text-[14px] text-muted text-center py-4">
            Aún no hay padres vinculados.
          </div>
        ) : (
          <div className="flex flex-col gap-3 mb-4">
            {parents.map((parent) => {
              const colors = getAvatarColor(parent.full_name);
              const initial = parent.full_name.charAt(0).toUpperCase();
              const label = RELATIONSHIP_LABELS[parent.relationship] || parent.relationship;
              return (
                <div key={parent.id} className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-head font-semibold text-[15px] shrink-0"
                    style={{ background: colors.bg, color: colors.color }}
                  >
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-[#3F362E] truncate">
                      {parent.full_name}
                    </div>
                    <div className="text-[12px] text-[#A89A8B]">{label}</div>
                  </div>
                </div>
              );
            })}

            {pendingInvitations.map((inv) => {
              const colors = getAvatarColor(inv.full_name);
              const initial = inv.full_name.charAt(0).toUpperCase();
              const label = RELATIONSHIP_LABELS[inv.relationship] || inv.relationship;
              return (
                <div key={inv.id} className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-head font-semibold text-[15px] shrink-0 opacity-60"
                    style={{ background: colors.bg, color: colors.color }}
                  >
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-semibold text-[#3F362E] truncate opacity-60">
                        {inv.full_name}
                      </span>
                      <span className="text-[10px] font-extrabold tracking-[0.5px] px-2 py-0.5 rounded-full bg-[#FBF1D6] text-[#A88526] shrink-0">
                        PENDIENTE
                      </span>
                    </div>
                    <div className="text-[12px] text-[#A89A8B]">{label} · {inv.email}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

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
      <LinkParentModal
        open={showLinkParent}
        kidName={kidName}
        childId={childId}
        onClose={() => setShowLinkParent(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
