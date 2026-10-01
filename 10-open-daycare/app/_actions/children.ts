'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export interface Room {
  id: string;
  daycare_id: string;
  name: string;
  created_at: string;
}

export interface Child {
  id: string;
  room_id: string;
  full_name: string;
  birth_date: string;
  enrolled_at: string;
  medical_notes: string | null;
  allergy_tags: string[];
  photo_consent: boolean;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface CreateChildInput {
  room_id: string;
  full_name: string;
  birth_date: string;
  enrolled_at: string;
  medical_notes?: string;
  allergy_tags?: string[];
  photo_consent?: boolean;
}

export async function getRooms(daycareId: string): Promise<Room[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('daycare_id', daycareId)
    .order('name');

  if (error) throw error;
  return data as Room[];
}

export async function getChildrenByRoom(roomId: string): Promise<Child[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('room_id', roomId)
    .eq('status', 'active')
    .order('full_name');

  if (error) throw error;
  return data as Child[];
}

export async function getAllChildren(
  daycareId: string,
): Promise<{ room: Room; children: Child[] }[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: rooms, error: roomsError } = await supabase
    .from('rooms')
    .select('*')
    .eq('daycare_id', daycareId)
    .order('name');

  if (roomsError) throw roomsError;

  const result: { room: Room; children: Child[] }[] = [];

  for (const room of rooms as Room[]) {
    const { data: children, error: childrenError } = await supabase
      .from('children')
      .select('*')
      .eq('room_id', room.id)
      .eq('status', 'active')
      .order('full_name');

    if (childrenError) throw childrenError;

    result.push({
      room,
      children: (children as Child[]) || [],
    });
  }

  return result;
}

export async function getChildById(id: string): Promise<Child | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data as Child;
}

export async function createChild(input: CreateChildInput): Promise<Child> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('children')
    .insert({
      room_id: input.room_id,
      full_name: input.full_name.trim(),
      birth_date: input.birth_date,
      enrolled_at: input.enrolled_at,
      medical_notes: input.medical_notes || null,
      allergy_tags: input.allergy_tags || [],
      photo_consent: input.photo_consent ?? true,
      status: 'active',
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/kids');

  return data as Child;
}
