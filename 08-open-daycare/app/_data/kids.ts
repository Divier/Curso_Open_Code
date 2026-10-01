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

export interface Kid {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  initial: string;
  age: number;
  room: string;
  birthDate: string;
  enrollmentDate: string;
  allergies: AllergyType[];
  medicalNotes: string;
  linkedParents: LinkedParent[];
  avatarBg: string;
  avatarColor: string;
}

export const kids: Kid[] = [
  {
    id: 'mateo-fernandez',
    firstName: 'Mateo',
    lastName: 'Fernández',
    fullName: 'Mateo Fernández',
    initial: 'M',
    age: 3,
    room: 'Soles',
    birthDate: '12 mar 2022',
    enrollmentDate: 'feb 2025',
    allergies: ['peanut'],
    medicalNotes:
      'Alergia al maní. Evitar frutos secos. Lleva inhalador en la mochila.',
    linkedParents: [
      {
        name: 'Lucía Fernández',
        initial: 'L',
        role: 'Mamá',
        status: 'active',
        avatarBg: '#C9B6E8',
        avatarColor: '#7B5FC0',
      },
      {
        name: 'Diego Fernández',
        initial: 'D',
        role: 'Papá',
        status: 'pending',
        avatarBg: '#A9C7E8',
        avatarColor: '#1F7A93',
      },
    ],
    avatarBg: '#A9D9E8',
    avatarColor: '#1F7A93',
  },
  {
    id: 'sofia-mendez',
    firstName: 'Sofía',
    lastName: 'Méndez',
    fullName: 'Sofía Méndez',
    initial: 'S',
    age: 2,
    room: 'Soles',
    birthDate: '5 ago 2023',
    enrollmentDate: 'mar 2025',
    allergies: [],
    medicalNotes: '',
    linkedParents: [
      {
        name: 'Ana Méndez',
        initial: 'A',
        role: 'Mamá',
        status: 'active',
        avatarBg: '#F4B8CC',
        avatarColor: '#C44A7A',
      },
    ],
    avatarBg: '#F4B8CC',
    avatarColor: '#C44A7A',
  },
  {
    id: 'benjamin-ruiz',
    firstName: 'Benjamín',
    lastName: 'Ruiz',
    fullName: 'Benjamín Ruiz',
    initial: 'B',
    age: 3,
    room: 'Soles',
    birthDate: '22 ene 2022',
    enrollmentDate: 'feb 2025',
    allergies: [],
    medicalNotes: '',
    linkedParents: [
      {
        name: 'Carolina Ruiz',
        initial: 'C',
        role: 'Mamá',
        status: 'active',
        avatarBg: '#B9DEC4',
        avatarColor: '#3E8B62',
      },
      {
        name: 'Martín Ruiz',
        initial: 'M',
        role: 'Papá',
        status: 'active',
        avatarBg: '#A9D9E8',
        avatarColor: '#1F7A93',
      },
    ],
    avatarBg: '#B9DEC4',
    avatarColor: '#3E8B62',
  },
  {
    id: 'valentina-soto',
    firstName: 'Valentina',
    lastName: 'Soto',
    fullName: 'Valentina Soto',
    initial: 'V',
    age: 2,
    room: 'Soles',
    birthDate: '14 nov 2023',
    enrollmentDate: 'abr 2025',
    allergies: [],
    medicalNotes: '',
    linkedParents: [],
    avatarBg: '#F4DC8E',
    avatarColor: '#9A7B1E',
  },
  {
    id: 'tomas-diaz',
    firstName: 'Tomás',
    lastName: 'Díaz',
    fullName: 'Tomás Díaz',
    initial: 'T',
    age: 3,
    room: 'Soles',
    birthDate: '3 jul 2022',
    enrollmentDate: 'feb 2025',
    allergies: ['lactose'],
    medicalNotes:
      'Intolerancia a la lactosa. Llevar leche sin lactosa en la lonchera.',
    linkedParents: [
      {
        name: 'Rosa Díaz',
        initial: 'R',
        role: 'Mamá',
        status: 'active',
        avatarBg: '#C9B6E8',
        avatarColor: '#7B5FC0',
      },
    ],
    avatarBg: '#C9B6E8',
    avatarColor: '#7B5FC0',
  },
  {
    id: 'emma-castro',
    firstName: 'Emma',
    lastName: 'Castro',
    fullName: 'Emma Castro',
    initial: 'E',
    age: 2,
    room: 'Soles',
    birthDate: '19 sep 2023',
    enrollmentDate: 'mar 2025',
    allergies: [],
    medicalNotes: '',
    linkedParents: [
      {
        name: 'Laura Castro',
        initial: 'L',
        role: 'Mamá',
        status: 'active',
        avatarBg: '#F4B8CC',
        avatarColor: '#C44A7A',
      },
    ],
    avatarBg: '#F4B8CC',
    avatarColor: '#C44A7A',
  },
  {
    id: 'lucas-romero',
    firstName: 'Lucas',
    lastName: 'Romero',
    fullName: 'Lucas Romero',
    initial: 'L',
    age: 3,
    room: 'Soles',
    birthDate: '8 may 2022',
    enrollmentDate: 'feb 2025',
    allergies: [],
    medicalNotes: '',
    linkedParents: [
      {
        name: 'Pablo Romero',
        initial: 'P',
        role: 'Papá',
        status: 'active',
        avatarBg: '#A9D9E8',
        avatarColor: '#1F7A93',
      },
    ],
    avatarBg: '#A9D9E8',
    avatarColor: '#1F7A93',
  },
  {
    id: 'olivia-vega',
    firstName: 'Olivia',
    lastName: 'Vega',
    fullName: 'Olivia Vega',
    initial: 'O',
    age: 2,
    room: 'Soles',
    birthDate: '30 dic 2023',
    enrollmentDate: 'abr 2025',
    allergies: [],
    medicalNotes: '',
    linkedParents: [
      {
        name: 'Marta Vega',
        initial: 'M',
        role: 'Mamá',
        status: 'active',
        avatarBg: '#B9DEC4',
        avatarColor: '#3E8B62',
      },
    ],
    avatarBg: '#B9DEC4',
    avatarColor: '#3E8B62',
  },
];

export function getKidById(id: string): Kid | undefined {
  return kids.find((k) => k.id === id);
}

export function parentCountLabel(parents: LinkedParent[]): string {
  const n = parents.length;
  if (n === 0) return 'sin padres vinculados';
  if (n === 1) return '1 padre vinculado';
  return `${n} padres vinculados`;
}

export const AVATAR_COLORS = [
  { bg: '#A9D9E8', color: '#1F7A93' },
  { bg: '#F4B8CC', color: '#C44A7A' },
  { bg: '#B9DEC4', color: '#3E8B62' },
  { bg: '#F4DC8E', color: '#9A7B1E' },
  { bg: '#C9B6E8', color: '#7B5FC0' },
];

export function randomAvatarBg(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)].bg;
}

export function randomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)].color;
}

export function generateKidId(fullName: string): string {
  return fullName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function calculateAge(birthDate: string): number {
  const parts = birthDate.split('/');
  if (parts.length !== 3) return 0;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return 0;
  const birth = new Date(year, month, day);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age < 0 ? 0 : age;
}

const MONTH_SHORT = [
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

export function formatBirthDateDisplay(ddmmyyyy: string): string {
  const parts = ddmmyyyy.split('/');
  if (parts.length !== 3) return ddmmyyyy;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  if (isNaN(day) || isNaN(month) || month < 0 || month > 11) return ddmmyyyy;
  return `${day} ${MONTH_SHORT[month]} ${parts[2]}`;
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

export function addKidToMock(kid: Kid): void {
  kids.push(kid);
}
