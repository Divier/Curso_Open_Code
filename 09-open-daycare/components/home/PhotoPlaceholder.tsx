import { PhotoIcon } from '@/components/shared/icons';

export function PhotoPlaceholder({ label }: { label: string }) {
  return (
    <a
      href="#"
      className="flex flex-col items-center justify-center gap-2 mt-[14px] border-[1.5px] border-dashed border-[#DBCDBA] rounded-[16px] bg-[#F4ECE1] h-[200px] text-[#B0A290]"
    >
      <PhotoIcon className="w-[30px] h-[30px]" />
      <span className="text-[13.5px]">{label}</span>
    </a>
  );
}
