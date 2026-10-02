'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import {
  MAX_IMAGES,
  MAX_IMAGE_SIZE,
  ALLOWED_IMAGE_TYPES,
  type PostType,
  type PostTarget,
} from '@/app/_data/posts';

export interface CreatePostInput {
  postType: PostType;
  description: string;
  targetType: PostTarget;
  targetChildId?: string | null;
  images?: File[];
}

export interface CreatePostResult {
  success: boolean;
  postId?: string;
  error?: string;
}

function getExtensionFromMimeType(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  return map[mimeType] || 'jpg';
}

export async function createPost(
  input: CreatePostInput,
): Promise<CreatePostResult> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No estás autenticado' };
  }

  // Get user profile
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role, daycare_id')
    .eq('id', user.id)
    .single();

  if (userError || !userData) {
    return { success: false, error: 'No se pudo verificar tu perfil' };
  }

  if (userData.role !== 'staff' && userData.role !== 'admin') {
    return {
      success: false,
      error: 'Solo el staff puede crear publicaciones',
    };
  }

  // Validate description
  if (!input.description || input.description.trim().length === 0) {
    return { success: false, error: 'La descripción no puede estar vacía' };
  }

  // Validate target type
  if (input.targetType !== 'kid' && input.targetType !== 'all') {
    return { success: false, error: 'Tipo de destinatario no válido' };
  }

  if (input.targetType === 'kid' && !input.targetChildId) {
    return {
      success: false,
      error: 'Debe seleccionar un niño como destinatario',
    };
  }

  // Validate images
  const images = input.images || [];
  if (images.length > MAX_IMAGES) {
    return {
      success: false,
      error: `Máximo ${MAX_IMAGES} imágenes permitidas`,
    };
  }

  for (const image of images) {
    if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
      return {
        success: false,
        error: `Formato no válido: ${image.type}. Solo se permiten JPG, PNG, WebP y GIF.`,
      };
    }
    if (image.size > MAX_IMAGE_SIZE) {
      return {
        success: false,
        error: `La imagen "${image.name}" excede 3 MB.`,
      };
    }
  }

  const daycareId = userData.daycare_id;
  if (!daycareId) {
    return {
      success: false,
      error: 'No tienes una guardería asignada',
    };
  }

  // Insert post
  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      daycare_id: daycareId,
      author_id: user.id,
      post_type: input.postType,
      description: input.description.trim(),
      target_type: input.targetType,
      target_child_id: input.targetChildId || null,
    })
    .select()
    .single();

  if (postError || !post) {
    return {
      success: false,
      error: postError?.message || 'No se pudo crear la publicación',
    };
  }

  // Upload images if any
  if (images.length > 0) {
    const uploadedPaths: string[] = [];

    try {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const ext = getExtensionFromMimeType(image.type);
        const uuid = crypto.randomUUID();
        const storagePath = `${daycareId}/${post.id}/${uuid}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(storagePath, image, {
            contentType: image.type,
            cacheControl: '3600',
          });

        if (uploadError) {
          throw uploadError;
        }

        uploadedPaths.push(storagePath);

        const { error: imageError } = await supabase
          .from('post_images')
          .insert({
            post_id: post.id,
            storage_path: storagePath,
            caption: null,
            sort_order: i,
          });

        if (imageError) {
          throw imageError;
        }
      }
    } catch (error: unknown) {
      // Rollback: delete uploaded images and the post
      for (const path of uploadedPaths) {
        await supabase.storage.from('post-images').remove([path]);
      }
      await supabase.from('posts').delete().eq('id', post.id);

      const message =
        error instanceof Error ? error.message : 'Error subiendo imágenes';
      return { success: false, error: message };
    }
  }

  revalidatePath('/');

  return { success: true, postId: post.id };
}
