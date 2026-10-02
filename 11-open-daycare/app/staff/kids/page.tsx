import { KidsPageClient } from '@/components/kids/KidsPageClient';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAllChildren, getRooms } from '@/app/_actions/children';

export default async function KidsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('daycare_id, role')
    .eq('id', user.id)
    .single();

  if (userError || !userData?.daycare_id) {
    redirect('/login');
  }

  const [groupedData, rooms] = await Promise.all([
    getAllChildren(userData.daycare_id),
    getRooms(userData.daycare_id),
  ]);

  return (
    <div className="max-w-[880px] w-full mx-auto px-5 md:px-10 pt-16 md:pt-[34px] pb-20">
      <KidsPageClient
        groupedData={groupedData}
        rooms={rooms}
        daycareId={userData.daycare_id}
      />
    </div>
  );
}
