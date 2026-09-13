'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createDream } from '@/lib/entities/dreams/repository';
import {
  dreamFormInputSchema,
  type DreamFormState,
} from '@/lib/entities/dreams/types';
import loginRequired from '@/lib/entities/users/loginRequired';

export async function createDreamAction(
  formData: FormData,
): Promise<DreamFormState> {
  const user = await loginRequired();

  const validationResult = dreamFormInputSchema.safeParse({
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

  const dream = await createDream({
    userId: user.id,
    ...validationResult.data,
  });

  if (!dream) {
    return { formError: 'Не удалось создать сон. Попробуйте ещё раз' };
  }

  revalidatePath('/dreams');
  redirect(`/dream/${dream.id}`);
}
