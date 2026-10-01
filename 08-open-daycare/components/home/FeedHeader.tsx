import { roomSubtitle, sidebarUser } from '@/app/_data/mock';

export function FeedHeader() {
  const firstName = sidebarUser.name.split(' ')[0];
  return (
    <div className="mb-6">
      <div className="text-[12.5px] font-extrabold tracking-[0.8px] text-accent mb-1">
        GUARDERÍA · SALA SOLES
      </div>
      <h1 className="font-head font-semibold text-[30px] text-ink m-0">
        Buenas, {firstName}
      </h1>
      <p className="mt-[5px] text-muted text-[14.5px]">{roomSubtitle}</p>
    </div>
  );
}
