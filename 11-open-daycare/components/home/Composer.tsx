import { sidebarUser } from '@/app/_data/mock';
import { CameraIcon } from '@/components/shared/icons';

export function Composer() {
  return (
    <a
      href="#"
      className="flex items-center gap-[14px] bg-card border border-line rounded-[18px] py-[14px] px-[18px] mb-6 shadow-[0_4px_14px_-10px_rgba(120,90,60,0.4)]"
    >
      <span className="w-10 h-10 rounded-full bg-accent-soft text-white font-head font-semibold text-[16px] flex items-center justify-center shrink-0">
        {sidebarUser.initial}
      </span>
      <span className="flex-1 text-muted text-[15px]">
        Compartí un momento…
      </span>
      <span className="w-[38px] h-[38px] rounded-[12px] bg-soft text-[#E0654A] flex items-center justify-center">
        <CameraIcon className="w-[19px] h-[19px]" />
      </span>
    </a>
  );
}
