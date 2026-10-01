export type NewPostType =
  | 'meal'
  | 'nap'
  | 'activity'
  | 'achievement'
  | 'mood'
  | 'photo'
  | 'announcement';

export const NEW_POST_TYPE_LABEL: Record<NewPostType, string> = {
  meal: 'Comida',
  nap: 'Siesta',
  activity: 'Actividad',
  achievement: 'Logro',
  mood: 'Ánimo',
  photo: 'Foto',
  announcement: 'Anuncio',
};

export const NEW_POST_TYPE_COLORS: Record<
  NewPostType,
  { bg: string; text: string }
> = {
  meal: { bg: '#9A7B1E', text: '#fff' },
  nap: { bg: '#E7DCF6', text: '#7B5FC0' },
  activity: { bg: '#2E89A6', text: '#fff' },
  achievement: { bg: '#CFEBD8', text: '#3E9B6C' },
  mood: { bg: '#F9D2DE', text: '#C56486' },
  photo: { bg: '#FBD8CC', text: '#D9684A' },
  announcement: { bg: '#CCD8F4', text: '#4E72C8' },
};

export type NewPostTarget =
  | {
      type: 'kid';
      id: string;
      name: string;
      initial: string;
      avatarBg: string;
      avatarColor: string;
    }
  | { type: 'all'; label: string };

export function getNewPostTargets(
  children?: { id: string; full_name: string }[],
): NewPostTarget[] {
  const kidTargets: NewPostTarget[] =
    children?.map((child) => ({
      type: 'kid',
      id: child.id,
      name: child.full_name,
      initial: child.full_name.charAt(0).toUpperCase(),
      avatarBg: '#A9D9E8',
      avatarColor: '#1F7A93',
    })) || [];

  return [...kidTargets, { type: 'all', label: 'Toda la sala' }];
}
