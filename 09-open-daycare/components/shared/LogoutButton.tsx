'use client';

import { createClient } from '@/utils/supabase/client';
import { LogoutIcon } from '@/components/shared/icons';

export function LogoutButton() {
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      title="Cerrar sesión"
      aria-label="Cerrar sesión"
      className="shrink-0 w-8 h-8 rounded-[10px] bg-canvas text-[#94887B] flex items-center justify-center hover:bg-[#E8DDD0] transition-colors"
    >
      <LogoutIcon className="w-4 h-4" />
    </button>
  );
}
