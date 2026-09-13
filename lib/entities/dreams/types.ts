import z from 'zod';

export type DreamRow = {
  id: number;
  user_id: number;
  title: string;
  description: string;
  rating: number;
  dream_date: Date | string;
  image_url: string | null;
  created_at: Date;
};

export type DreamDto = {
  id: number;
  userId: number;
  title: string;
  description: string;
  rating: number;
  dreamDate: string;
  imageUrl: string | null;
  createdAt: string;
};

export const dreamFormInputSchema = z.object({
  title: z.string().trim().min(1, 'Название должно быть заполнено'),
  description: z.string().trim().min(1, 'Описание должно быть заполнено'),
  rating: z.coerce
    .number({ error: 'Укажите оценку' })
    .int('Оценка должна быть целым числом')
    .min(1, 'Минимальная оценка — 1')
    .max(10, 'Максимальная оценка — 10'),
  dreamDate: z.iso.date({ error: 'Укажите дату' }),
});

export const createDreamInputSchema = dreamFormInputSchema.extend({
  userId: z.number(),
});

export const updateDreamInputSchema = dreamFormInputSchema;

export type DreamFormInput = z.infer<typeof dreamFormInputSchema>;
export type CreateDreamInput = z.infer<typeof createDreamInputSchema>;
export type UpdateDreamInput = z.infer<typeof updateDreamInputSchema>;

export type DreamFormState = {
  fieldErrors?: Partial<Record<keyof DreamFormInput, string[]>>;
  formError?: string;
};

export type CreateDreamDto = {
  userId: number;
  title: string;
  description: string;
  rating: number;
  dreamDate: string;
  imageUrl?: string | null;
};

export type UpdateDreamDto = Partial<CreateDreamDto>;
