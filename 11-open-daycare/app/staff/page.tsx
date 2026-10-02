import { getPosts } from '@/app/_queries/posts';
import { FeedContent } from '@/components/home/FeedContent';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function StaffPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const posts = await getPosts();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole: 'staff' | 'admin' | 'parent' | undefined;
  let realChildren: { id: string; full_name: string }[] | undefined;

  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('role, daycare_id')
      .eq('id', user.id)
      .single();

    if (userData) {
      userRole = userData.role as 'staff' | 'admin' | 'parent';

      if (userData.role === 'parent') {
        const { data: pcData } = await supabase
          .from('parent_children')
          .select('child_id')
          .eq('parent_id', user.id);

        const childIds = pcData?.map((r: { child_id: string }) => r.child_id) || [];
        if (childIds.length > 0) {
          const { data: kidsData } = await supabase
            .from('children')
            .select('id, full_name')
            .in('id', childIds);

          realChildren = kidsData as { id: string; full_name: string }[] || [];
        }
      } else if (userData.daycare_id) {
        const { data: roomsData } = await supabase
          .from('rooms')
          .select('id')
          .eq('daycare_id', userData.daycare_id);

        const roomIds = roomsData?.map((r: { id: string }) => r.id) || [];
        if (roomIds.length > 0) {
          const { data: kidsData } = await supabase
            .from('children')
            .select('id, full_name')
            .in('room_id', roomIds)
            .eq('status', 'active')
            .order('full_name');

          realChildren = kidsData as { id: string; full_name: string }[] || [];
        }
      }
    }
  }

  return <FeedContent posts={posts} userRole={userRole} realChildren={realChildren} />;
}
