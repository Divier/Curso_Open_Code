export type PostType =
  | 'meal'
  | 'nap'
  | 'activity'
  | 'achievement'
  | 'mood'
  | 'photo'
  | 'announcement';

export type PostTarget = 'kid' | 'all';

export interface Post {
  id: string;
  daycare_id: string;
  author_id: string;
  post_type: PostType;
  description: string;
  target_type: PostTarget;
  target_child_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostImage {
  id: string;
  post_id: string;
  storage_path: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export const POST_TYPE_LABEL: Record<PostType, string> = {
  meal: 'Comida',
  nap: 'Siesta',
  activity: 'Actividad',
  achievement: 'Logro',
  mood: 'Ánimo',
  photo: 'Foto',
  announcement: 'Anuncio',
};

export const POST_TYPE_COLORS: Record<PostType, { bg: string; text: string }> =
  {
    meal: { bg: '#9A7B1E', text: '#fff' },
    nap: { bg: '#E7DCF6', text: '#7B5FC0' },
    activity: { bg: '#2E89A6', text: '#fff' },
    achievement: { bg: '#CFEBD8', text: '#3E9B6C' },
    mood: { bg: '#F9D2DE', text: '#C56486' },
    photo: { bg: '#FBD8CC', text: '#D9684A' },
    announcement: { bg: '#CCD8F4', text: '#4E72C8' },
  };

export interface PostTypeConfig {
  label: string;
  bg: string;
  text: string;
}

export function getPostTypeConfig(type: PostType): PostTypeConfig {
  return {
    label: POST_TYPE_LABEL[type],
    bg: POST_TYPE_COLORS[type].bg,
    text: POST_TYPE_COLORS[type].text,
  };
}

export const MAX_IMAGES = 10;
export const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3 MB
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export function buildPostImageUrl(storagePath: string): string {
  return `${SUPABASE_URL}/storage/v1/object/authenticated/post-images/${storagePath}`;
}

export interface ValidateImageResult {
  valid: boolean;
  error?: string;
}

export function validateImage(file: File): ValidateImageResult {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Formato no válido: ${file.type}. Solo se permiten JPG, PNG, WebP y GIF.`,
    };
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `La imagen excede 3 MB (${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
    };
  }
  return { valid: true };
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'hace un momento';
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffHr < 24) return `hace ${diffHr} h`;
  if (diffDay === 1) return 'ayer';
  if (diffDay < 7) return `hace ${diffDay} días`;

  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}
