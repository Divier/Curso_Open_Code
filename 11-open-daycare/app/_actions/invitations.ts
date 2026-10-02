'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { generateUniqueCode } from '@/app/_lib/invitation-code';
import { sendInvitationEmail } from '@/app/_lib/email';

export interface Invitation {
  id: string;
  child_id: string;
  invited_by: string;
  full_name: string;
  email: string;
  relationship: 'father' | 'mother' | 'guardian';
  code: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export interface ParentChild {
  id: string;
  parent_id: string;
  child_id: string;
  relationship: 'father' | 'mother' | 'guardian';
  created_at: string;
  full_name: string;
  role: string;
}

export async function createInvitation(input: {
  childId: string;
  fullName: string;
  email: string;
  relationship: 'father' | 'mother' | 'guardian';
}): Promise<{ code: string; expiresAt: string; error: string | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { code: '', expiresAt: '', error: 'No estás autenticado' };
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (userError || !userData) {
    return { code: '', expiresAt: '', error: 'No se pudo verificar tu perfil' };
  }

  if (userData.role !== 'staff' && userData.role !== 'admin') {
    return { code: '', expiresAt: '', error: 'Solo el staff puede crear invitaciones' };
  }

  const { data: childData, error: childError } = await supabase
    .from('children')
    .select('full_name')
    .eq('id', input.childId)
    .single();

  if (childError || !childData) {
    return { code: '', expiresAt: '', error: 'No se encontró el niño' };
  }

  const code = await generateUniqueCode();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { error: insertError } = await supabase
    .from('invitations')
    .insert({
      child_id: input.childId,
      invited_by: user.id,
      full_name: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      relationship: input.relationship,
      code,
      expires_at: expiresAt.toISOString(),
    });

  if (insertError) {
    return { code: '', expiresAt: '', error: insertError.message };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const activationUrl = `${appUrl}/activate?code=${code}`;

  const emailResult = await sendInvitationEmail({
    to: input.email,
    childName: childData.full_name,
    staffName: userData.full_name,
    code,
    activationUrl,
  });

  revalidatePath(`/staff/kids/${input.childId}`);

  return {
    code,
    expiresAt: expiresAt.toISOString(),
    error: emailResult.error,
  };
}

export interface PendingInvitation {
  id: string;
  full_name: string;
  email: string;
  relationship: 'father' | 'mother' | 'guardian';
  code: string;
  expires_at: string;
  created_at: string;
}

export async function getPendingInvitationsByChild(childId: string): Promise<PendingInvitation[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('child_id', childId)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    relationship: row.relationship,
    code: row.code,
    expires_at: row.expires_at,
    created_at: row.created_at,
  }));
}

interface ParentWithUser {
  id: string;
  parent_id: string;
  child_id: string;
  relationship: 'father' | 'mother' | 'guardian';
  created_at: string;
  users: { full_name: string; role: string } | null;
}

export async function getParentsByChild(childId: string): Promise<ParentChild[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('parent_children')
    .select('*, users!parent_children_parent_id_fkey(full_name, role)')
    .eq('child_id', childId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data as ParentWithUser[]).map((row) => ({
    id: row.id,
    parent_id: row.parent_id,
    child_id: row.child_id,
    relationship: row.relationship,
    created_at: row.created_at,
    full_name: row.users?.full_name || 'Desconocido',
    role: row.users?.role || 'parent',
  }));
}

export async function validateInvitationCode(code: string): Promise<{
  valid: boolean;
  invitation: Invitation | null;
  childName: string | null;
  roomName: string | null;
  error: string | null;
}> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: invitation, error } = await supabase
    .from('invitations')
    .select('*, children!invitations_child_id_fkey(full_name, room_id)')
    .eq('code', code.toUpperCase())
    .single();

  if (error || !invitation) {
    return { valid: false, invitation: null, childName: null, roomName: null, error: 'Código de invitación no válido' };
  }

  if (invitation.status !== 'pending') {
    return { valid: false, invitation: null, childName: null, roomName: null, error: 'Esta invitación ya fue usada o fue cancelada' };
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return { valid: false, invitation: null, childName: null, roomName: null, error: 'Esta invitación ha expirado' };
  }

  let roomName: string | null = null;
  if (invitation.children?.room_id) {
    const { data: roomData } = await supabase
      .from('rooms')
      .select('name')
      .eq('id', invitation.children.room_id)
      .single();

    if (roomData) {
      roomName = roomData.name;
    }
  }

  return {
    valid: true,
    invitation: invitation as unknown as Invitation,
    childName: invitation.children?.full_name || null,
    roomName,
    error: null,
  };
}

export async function activateInvitation(input: {
  code: string;
  email: string;
  password: string;
  fullName: string;
}): Promise<{ error: string | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: invitation, error: invitationError } = await supabase
    .from('invitations')
    .select('*')
    .eq('code', input.code.toUpperCase())
    .single();

  if (invitationError || !invitation) {
    return { error: 'Código de invitación no válido' };
  }

  if (invitation.status !== 'pending') {
    return { error: 'Esta invitación ya fue usada o fue cancelada' };
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return { error: 'Esta invitación ha expirado' };
  }

  const adminSupabase = createAdminClient();

  const { data: authData, error: signUpError } = await adminSupabase.auth.admin.createUser({
    email: input.email.toLowerCase(),
    password: input.password,
    email_confirm: true,
    user_metadata: {
      full_name: input.fullName.trim(),
      role: 'parent',
      daycare_id: null,
    },
  });

  if (signUpError || !authData.user) {
    return { error: signUpError?.message || 'No se pudo crear la cuenta' };
  }

  const { error: parentChildError } = await adminSupabase.from('parent_children').insert({
    parent_id: authData.user.id,
    child_id: invitation.child_id,
    relationship: invitation.relationship,
  });

  if (parentChildError) {
    return { error: 'Se creó la cuenta pero no se pudo vincular al niño. Contacta al staff.' };
  }

  const { error: updateError } = await adminSupabase
    .from('invitations')
    .update({ status: 'accepted', accepted_at: new Date().toISOString() })
    .eq('id', invitation.id);

  if (updateError) {
    return { error: 'Se creó la cuenta pero no se pudo actualizar la invitación.' };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: input.email.toLowerCase(),
    password: input.password,
  });

  if (signInError) {
    return { error: 'Cuenta creada pero no se pudo iniciar sesión. Iniciá sesión manualmente.' };
  }

  return { error: null };
}
