import {
  type FeedPost,
  type PostType,
  POST_TYPE_LABEL,
} from '@/app/_data/mock';
import {
  CommentIcon,
  HeartIcon,
  MegaphoneIcon,
} from '@/components/shared/icons';
import { PhotoPlaceholder } from '@/components/home/PhotoPlaceholder';

const BADGE: Record<
  PostType,
  { container: string; dot: string; text: string }
> = {
  achievement: {
    container: 'bg-[#CFEBD8]',
    dot: 'bg-achievement',
    text: 'text-achievement',
  },
  activity: {
    container: 'bg-[#C7E7F1]',
    dot: 'bg-staff',
    text: 'text-staff',
  },
  announcement: {
    container: 'bg-[#CCD8F4]',
    dot: 'bg-announcement',
    text: 'text-announcement',
  },
};

export function PostCard({ post }: { post: FeedPost }) {
  const badge = BADGE[post.type];
  return (
    <article className="bg-card border border-line rounded-[20px] py-5 px-[22px] shadow-[0_4px_16px_-12px_rgba(120,90,60,0.5)]">
      <div className="flex items-center gap-3 mb-[14px]">
        <span
          className="w-[44px] h-[44px] rounded-full font-head font-semibold text-[17px] flex items-center justify-center shrink-0"
          style={{ backgroundColor: post.avatarBg, color: post.avatarColor }}
        >
          {post.avatarIcon === 'megaphone' ? (
            <MegaphoneIcon className="w-5 h-5" />
          ) : (
            post.authorInitial
          )}
        </span>
        <div className="flex-1">
          <div className="font-head font-semibold text-[16.5px] text-ink">
            {post.authorName}
          </div>
          <div className="text-[12.5px] text-muted">
            {post.time}
            {post.publishedByMe ? ' · publicado por vos' : ''}
          </div>
        </div>
        <div
          className={`flex items-center gap-[7px] py-[6px] px-3 rounded-full ${badge.container}`}
        >
          <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
          <span
            className={`text-[12px] font-extrabold tracking-[0.5px] ${badge.text}`}
          >
            {POST_TYPE_LABEL[post.type]}
          </span>
        </div>
      </div>

      <div className="text-[12.5px] text-muted mb-[10px]">
        Para: {post.audience}
      </div>

      <p className="text-[15.5px] leading-[1.55] text-[#4A4038] m-0">
        {post.text}
      </p>

      {post.photoPlaceholder && (
        <PhotoPlaceholder label={post.photoPlaceholder.label} />
      )}

      <div className="flex items-center gap-[18px] mt-4 pt-[14px] border-t border-[#F0E6D8]">
        <span className="flex items-center gap-[7px] text-[#E0654A] font-bold text-[14px]">
          <HeartIcon className="w-[19px] h-[19px]" />
          {post.hearts}
        </span>
        <a
          href="#"
          className="flex items-center gap-[7px] text-[#94887B] font-bold text-[14px]"
        >
          <CommentIcon className="w-[18px] h-[18px]" />
          {post.comments}
        </a>
        <span className="flex-1" />
        <a href="#" className="text-[#C5503A] font-extrabold text-[14px]">
          Editar
        </a>
      </div>
    </article>
  );
}
