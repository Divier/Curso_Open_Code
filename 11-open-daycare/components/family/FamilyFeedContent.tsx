'use client';

import { useState } from 'react';
import { FeedHeader } from '@/components/home/FeedHeader';
import { FeedDivider } from '@/components/home/FeedDivider';
import { PostCard } from '@/components/home/PostCard';
import type { FeedPost } from '@/app/_queries/posts';

interface FamilyFeedContentProps {
  posts: FeedPost[];
  childList: { id: string; full_name: string }[];
}

export function FamilyFeedContent({ posts, childList }: FamilyFeedContentProps) {
  const [selectedChild, setSelectedChild] = useState<string>('all');

  const filteredPosts = selectedChild === 'all'
    ? posts
    : posts.filter((post) => {
        const childName = childList.find((c) => c.id === selectedChild)?.full_name?.split(' ')[0];
        return post.audience.includes(childName || '') || post.audience === 'toda la sala';
      });

  return (
    <div className="max-w-[760px] w-full mx-auto px-5 md:px-10 pt-16 md:pt-[34px] pb-20">
      <FeedHeader />

      {childList.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedChild('all')}
            className={
              'px-4 py-2 rounded-full text-[14px] font-semibold transition-colors ' +
              (selectedChild === 'all'
                ? 'bg-accent text-white'
                : 'bg-soft text-[#6E6359] hover:bg-soft/80')
            }
          >
            Todos
          </button>
          {childList.map((child) => (
            <button
              key={child.id}
              type="button"
              onClick={() => setSelectedChild(child.id)}
              className={
                'px-4 py-2 rounded-full text-[14px] font-semibold transition-colors ' +
                (selectedChild === child.id
                  ? 'bg-accent text-white'
                  : 'bg-soft text-[#6E6359] hover:bg-soft/80')
              }
            >
              {child.full_name.split(' ')[0]}
            </button>
          ))}
        </div>
      )}

      <FeedDivider />
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 text-muted">
          Aún no hay publicaciones
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
