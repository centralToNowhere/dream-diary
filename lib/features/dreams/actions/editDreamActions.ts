'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { updateDream } from '@/lib/entities/dreams/repository';
import {
  updateDreamInputSchema,
  type DreamFormState,
} from '@/lib/entities/dreams/types';
import loginRequired from '@/lib/entities/users/loginRequired';

export async function editDreamAction(
  dreamId: number,
  formData: FormData,
): Promise<DreamFormState> {
  const user = await loginRequired();
  const validationResult = updateDreamInputSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    rating: formData.get('rating'),
    dreamDate: formData.get('dreamDate'),
  });

  if (!validationResult.success) {
    return {
      fieldErrors: validationResult.error.flatten().fieldErrors,
    };
  }

  const dream = await updateDream(dreamId, user.id, validationResult.data);

  if (!dream) {
    return { formError: 'Сон не найден или не удалось сохранить изменения' };
  }

  revalidatePath('/dreams');
  revalidatePath(`/dream/${dream.id}`);
  redirect(`/dream/${dream.id}`);
}
