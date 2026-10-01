import Link from 'next/link';
import type { Kid } from '@/app/_data/kids';
import {
  ALLERGY_BADGE,
  ALLERGY_LABEL,
  parentCountLabel,
} from '@/app/_data/kids';
import { ChevronRightIcon } from '@/components/shared/icons';

interface KidCardProps {
  kid: Kid;
}

export function KidCard({ kid }: KidCardProps) {
  const hasAllergies = kid.allergies.length > 0;
  const firstAllergy = hasAllergies ? kid.allergies[0] : 'none';
  const badge = ALLERGY_BADGE[firstAllergy];
  const parentsLabel = parentCountLabel(kid.linkedParents);
  const noParents = kid.linkedParents.length === 0;

  return (
    <Link
      href={`/kids/${kid.id}`}
      className="kid-card-hover flex items-center gap-[14px] min-w-0 bg-card border border-line rounded-[18px] px-4 py-4 shadow-[0_4px_14px_-12px_rgba(120,90,60,0.5)] transition-[transform,border-color] duration-150 hover:border-[#F2A78E]"
    >
      <div
        className="w-12 h-12 rounded-full font-head font-semibold text-[19px] flex items-center justify-center shrink-0"
        style={{ background: kid.avatarBg, color: kid.avatarColor }}
      >
        {kid.initial}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-head font-semibold text-[16px] text-ink truncate">
          {kid.fullName}
        </div>
        <div className="text-[13px] text-muted">
          {kid.age} años · {parentsLabel}
        </div>
      </div>
      {hasAllergies ? (
        <span
          className="flex-none text-[11px] font-extrabold px-[9px] py-[5px] rounded-full"
          style={{ background: badge.bg, color: badge.color }}
        >
          {ALLERGY_LABEL[firstAllergy]}
        </span>
      ) : noParents ? (
        <span className="flex-none text-[11px] font-extrabold px-[9px] py-[5px] rounded-full bg-[#F9D2DE] text-[#C56486]">
          VINCULAR
        </span>
      ) : (
        <ChevronRightIcon className="flex-none w-[18px] h-[18px] text-[#CBB89F]" />
      )}
    </Link>
  );
}
