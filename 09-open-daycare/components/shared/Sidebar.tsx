'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { getActiveNav } from '@/app/_data/mock';
import {
  BellIcon,
  HomeIcon,
  KidsIcon,
  PlusIcon,
  SunIcon,
  UserIcon,
} from '@/components/shared/icons';
import { LogoutButton } from '@/components/shared/LogoutButton';
import type { NavIcon } from '@/app/_data/mock';

const navIcon: Record<NavIcon, typeof HomeIcon> = {
  home: HomeIcon,
  kids: KidsIcon,
  bell: BellIcon,
  user: UserIcon,
};

interface UserInfo {
  name: string;
  role: string;
  initial: string;
}

export function SidebarContent({
  pathname,
  onOpenNewPost,
  userInfo,
}: {
  pathname?: string;
  onOpenNewPost?: () => void;
  userInfo: UserInfo;
}) {
  const items = pathname ? getActiveNav(pathname) : [];

  return (
    <>
      <Link
        href="/"
        className="flex items-center gap-[11px] pt-1 px-2 pb-[22px]"
      >
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

      <button
        type="button"
        onClick={onOpenNewPost}
        className="flex items-center justify-center gap-2 w-full p-3 rounded-[14px] text-white font-extrabold text-[14.5px] mb-[18px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] shadow-[0_8px_18px_-8px_rgba(238,129,100,0.75)]"
      >
        <PlusIcon className="w-[17px] h-[17px]" />
        Nueva publicación
      </button>

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
            {userInfo.initial}
          </span>
          <span className="flex-1 min-w-0">
            <span className="block font-extrabold text-[14px] text-ink">
              {userInfo.name}
            </span>
            <span className="block text-[12px] text-muted">
              {userInfo.role}
            </span>
          </span>
          <LogoutButton />
        </div>
      </div>
    </>
  );
}

export function Sidebar({
  pathname,
  onOpenNewPost,
}: {
  pathname?: string;
  onOpenNewPost?: () => void;
}) {
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: '', role: '', initial: '' });

  useEffect(() => {
    async function fetchUserInfo() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setUserInfo({ name: '', role: '', initial: '' });
        return;
      }

      const { data: profile } = await supabase
        .from('users')
        .select('full_name, role')
        .eq('id', user.id)
        .single();

      const name = profile?.full_name || user.email?.split('@')[0] || '';
      const initial = name.charAt(0).toUpperCase();
      const roleLabel = profile?.role === 'staff' ? 'Personal' : profile?.role === 'admin' ? 'Administrador' : 'Familia';

      setUserInfo({ name, role: roleLabel, initial });
    }

    fetchUserInfo();
  }, []);

  return (
    <aside className="hidden md:flex flex-col w-[248px] shrink-0 bg-card border-r border-line sticky top-0 h-screen py-6 px-4">
      <SidebarContent pathname={pathname} onOpenNewPost={onOpenNewPost} userInfo={userInfo} />
    </aside>
  );
}
