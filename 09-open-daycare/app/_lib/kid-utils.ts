// Allergy types with visual labels and colors (Spanish UI, English data).
export type AllergyType = 'peanut' | 'lactose' | 'gluten' | 'none';

export const ALLERGY_LABEL: Record<AllergyType, string> = {
  peanut: 'MANÍ',
  lactose: 'LACTOSA',
  gluten: 'GLUTEN',
  none: '',
};

export const ALLERGY_BADGE: Record<AllergyType, { bg: string; color: string }> =
  {
    peanut: { bg: '#FBD8CC', color: '#D9684A' },
    lactose: { bg: '#FBD8CC', color: '#D9684A' },
    gluten: { bg: '#F9D2DE', color: '#C56486' },
    none: { bg: 'transparent', color: 'transparent' },
  };

// Parent status.
export type ParentStatus = 'active' | 'pending';

export const PARENT_STATUS_LABEL: Record<ParentStatus, string> = {
  active: 'ACTIVA',
  pending: 'PENDIENTE',
};

export const PARENT_STATUS_BADGE: Record<
  ParentStatus,
  { bg: string; color: string }
> = {
  active: { bg: '#CFEBD8', color: '#3E9B6C' },
  pending: { bg: '#F7E7A6', color: '#9A7B1E' },
};

export interface LinkedParent {
  name: string;
  initial: string;
  role: string;
  status: ParentStatus;
  avatarBg: string;
  avatarColor: string;
}

export function parentCountLabel(count: number): string {
  if (count === 0) return 'sin padres vinculados';
  if (count === 1) return '1 padre vinculado';
  return `${count} padres vinculados`;
}

export const AVATAR_COLORS = [
  { bg: '#A9D9E8', color: '#1F7A93' },
  { bg: '#F4B8CC', color: '#C44A7A' },
  { bg: '#B9DEC4', color: '#3E8B62' },
  { bg: '#F4DC8E', color: '#9A7B1E' },
  { bg: '#C9B6E8', color: '#7B5FC0' },
];

export function stringToAvatarColors(str: string): {
  bg: string;
  color: string;
} {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function calculateAgeFromISO(isoDate: string): number {
  const birth = new Date(isoDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age < 0 ? 0 : age;
}

export function formatBirthDateDisplay(isoDate: string): string {
  const date = new Date(isoDate);
  const months = [
    'ene',
    'feb',
    'mar',
    'abr',
    'may',
    'jun',
    'jul',
    'ago',
    'sep',
    'oct',
    'nov',
    'dic',
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function isValidDate(ddmmyyyy: string): boolean {
  const parts = ddmmyyyy.split('/');
  if (parts.length !== 3) return false;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > new Date().getFullYear()) return false;
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function parseAllergyText(text: string): AllergyType[] {
  if (!text.trim()) return [];
  const lower = text.toLowerCase().trim();
  const result: AllergyType[] = [];
  if (lower.includes('maní') || lower.includes('mani')) result.push('peanut');
  if (lower.includes('lactosa')) result.push('lactose');
  if (lower.includes('gluten')) result.push('gluten');
  if (result.length === 0) return [];
  return [...new Set(result)];
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isoToYYYYMMDD(isoDate: string): string {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function randomAvatarBg(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)].bg;
}

export function randomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)].color;
}

export interface LinkedParent {
  name: string;
  initial: string;
  role: string;
  status: ParentStatus;
  avatarBg: string;
  avatarColor: string;
}
