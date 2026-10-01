'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { SidebarContent } from '@/components/shared/Sidebar';
import { CloseIcon, MenuIcon } from '@/components/shared/icons';

interface MobileNavProps {
  pathname?: string;
}

interface UserInfo {
  name: string;
  role: string;
  initial: string;
}

export function MobileNav({ pathname }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: '', role: '', initial: '' });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

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
    <>
      <header className="md:hidden fixed top-0 inset-x-0 z-40 h-14 bg-card border-b border-line flex items-center gap-3 px-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={open}
          className="w-10 h-10 rounded-[12px] bg-soft text-accent flex items-center justify-center"
        >
          <MenuIcon className="w-5 h-5" />
        </button>
        <span className="font-head font-semibold text-ink text-[17px] leading-none">
          OpenDayCare
        </span>
        <span className="text-[11.5px] text-muted">Sala Soles</span>
      </header>

      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-black/40"
          />
          <aside className="absolute top-0 left-0 h-screen w-[248px] bg-card border-r border-line flex flex-col py-6 px-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
              className="absolute top-4 right-4 w-8 h-8 rounded-[10px] bg-canvas text-[#94887B] flex items-center justify-center"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
            <SidebarContent pathname={pathname} userInfo={userInfo} />
          </aside>
        </div>
      )}
    </>
  );
}
