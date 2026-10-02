import { getFamilyPosts } from '@/app/_queries/posts';
import { FamilyFeedContent } from '@/components/family/FamilyFeedContent';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function FamilyPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role, daycare_id')
    .eq('id', user.id)
    .single();

  if (!userData || userData.role !== 'parent') {
    redirect('/staff');
  }

  const { data: pcData } = await supabase
    .from('parent_children')
    .select('child_id')
    .eq('parent_id', user.id);

  const childIds = pcData?.map((r: { child_id: string }) => r.child_id) || [];

  let children: { id: string; full_name: string }[] = [];
  if (childIds.length > 0) {
    const { data: kidsData } = await supabase
      .from('children')
      .select('id, full_name')
      .in('id', childIds);

    children = kidsData as { id: string; full_name: string }[] || [];
  }

  const posts = await getFamilyPosts(user.id);

  return <FamilyFeedContent posts={posts} childList={children} />;
}
