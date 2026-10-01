import Link from 'next/link';
import { getActiveNav, sidebarUser } from '@/app/_data/mock';
import {
  BellIcon,
  HomeIcon,
  KidsIcon,
  LogoutIcon,
  PlusIcon,
  SunIcon,
  UserIcon,
} from '@/components/shared/icons';
import type { NavIcon } from '@/app/_data/mock';

const navIcon: Record<NavIcon, typeof HomeIcon> = {
  home: HomeIcon,
  kids: KidsIcon,
  bell: BellIcon,
  user: UserIcon,
};

export function SidebarContent({ pathname }: { pathname?: string }) {
  const items = pathname ? getActiveNav(pathname) : [];

  return (
    <>
      <Link href="/" className="flex items-center gap-[11px] pt-1 px-2 pb-[22px]">
        <span className="w-[38px] h-[38px] rounded-[12px] bg-[linear-gradient(155deg,#F8C3A8,#F2937A)] flex items-center justify-center shrink-0 text-white">
          <SunIcon className="w-[21px] h-[21px]" />
        </span>
        <span>
          <span className="block font-head font-semibold text-[17px] text-ink leading-none">
            OpenDayCare
          </span>
          <span className="block text-[11.5px] text-muted mt-[2px]">
            Sala Soles
          </span>
        </span>
      </Link>

      <a
        href="#"
        className="flex items-center justify-center gap-2 w-full p-3 rounded-[14px] text-white font-extrabold text-[14.5px] mb-[18px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] shadow-[0_8px_18px_-8px_rgba(238,129,100,0.75)]"
      >
        <PlusIcon className="w-[17px] h-[17px]" />
        Nueva publicación
      </a>

      <nav className="flex flex-col gap-1 flex-1">
        {items.map((item) => {
          const Icon = navIcon[item.icon];
          return (
            <Link
              key={item.label}
              href={item.href}
              className={
                'flex items-center gap-3 py-[11px] px-3 rounded-[12px] text-[14.5px] ' +
                (item.active
                  ? 'bg-soft text-accent font-extrabold'
                  : 'text-[#6E6359] font-semibold')
              }
            >
              <Icon className="w-[19px] h-[19px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line pt-[14px] mt-[10px]">
        <div className="flex items-center gap-[11px] py-[6px] px-2">
          <span className="w-[38px] h-[38px] rounded-full bg-accent-soft text-white font-head font-semibold text-[16px] flex items-center justify-center shrink-0">
            {sidebarUser.initial}
          </span>
          <span className="flex-1 min-w-0">
            <span className="block font-extrabold text-[14px] text-ink">
              {sidebarUser.name}
            </span>
            <span className="block text-[12px] text-muted">
              {sidebarUser.role}
            </span>
          </span>
          <Link
            href="#"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className="shrink-0 w-8 h-8 rounded-[10px] bg-canvas text-[#94887B] flex items-center justify-center"
          >
            <LogoutIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </>
  );
}

export function Sidebar({ pathname }: { pathname?: string }) {
  return (
    <aside className="hidden md:flex flex-col w-[248px] shrink-0 bg-card border-r border-line sticky top-0 h-screen py-6 px-4">
      <SidebarContent pathname={pathname} />
    </aside>
  );
}
