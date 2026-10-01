import Link from 'next/link';
import type { Child } from '@/app/_actions/children';
import {
  ALLERGY_BADGE,
  ALLERGY_LABEL,
  parentCountLabel,
  stringToAvatarColors,
  calculateAgeFromISO,
  type AllergyType,
} from '@/app/_lib/kid-utils';
import { ChevronRightIcon } from '@/components/shared/icons';

interface KidCardProps {
  child: Child;
  parentCount?: number;
}

export function KidCard({ child, parentCount = 0 }: KidCardProps) {
  const allergyTags = child.allergy_tags || [];
  const hasAllergies = allergyTags.length > 0;

  let allergyBadge: AllergyType = 'none';
  const lowerTags = allergyTags.map((t) => t.toLowerCase());
  if (lowerTags.some((t) => t.includes('maní') || t.includes('mani'))) {
    allergyBadge = 'peanut';
  } else if (lowerTags.some((t) => t.includes('lactosa'))) {
    allergyBadge = 'lactose';
  } else if (lowerTags.some((t) => t.includes('gluten'))) {
    allergyBadge = 'gluten';
  }

  const badge = ALLERGY_BADGE[allergyBadge];
  const parentsLabel = parentCountLabel(parentCount);
  const noParents = parentCount === 0;

  const age = calculateAgeFromISO(child.birth_date);
  const colors = stringToAvatarColors(child.full_name);
  const initial = child.full_name.charAt(0).toUpperCase();

  return (
    <Link
      href={`/kids/${child.id}`}
      className="kid-card-hover flex items-center gap-[14px] min-w-0 bg-card border border-line rounded-[18px] px-4 py-4 shadow-[0_4px_14px_-12px_rgba(120,90,60,0.5)] transition-[transform,border-color] duration-150 hover:border-[#F2A78E]"
    >
      <div
        className="w-12 h-12 rounded-full font-head font-semibold text-[19px] flex items-center justify-center shrink-0"
        style={{ background: colors.bg, color: colors.color }}
      >
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-head font-semibold text-[16px] text-ink truncate">
          {child.full_name}
        </div>
        <div className="text-[13px] text-muted">
          {age} años · {parentsLabel}
        </div>
      </div>
      {hasAllergies ? (
        <span
          className="flex-none text-[11px] font-extrabold px-[9px] py-[5px] rounded-full"
          style={{ background: badge.bg, color: badge.color }}
        >
          {ALLERGY_LABEL[allergyBadge]}
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
