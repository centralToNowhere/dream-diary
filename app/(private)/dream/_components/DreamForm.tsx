'use client';

import Link from 'next/link';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import {
  dreamFormInputSchema,
  type DreamDto,
  type DreamFormInput,
  type DreamFormState,
} from '@/lib/entities/dreams/types';
import { Input, Label, TextArea, Button, Form } from '@/_components/ui';
import styles from './DreamForm.module.css';

type DreamFormProps = {
  dream?: DreamDto;
  mode: 'create' | 'edit';
  action: (formData: FormData) => DreamFormState | Promise<DreamFormState>;
};

type DreamFormValues = z.input<typeof dreamFormInputSchema>;

export default function DreamForm({ dream, mode, action }: DreamFormProps) {
  const isEdit = mode === 'edit';
  const [formError, setFormError] = useState<string>();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<DreamFormValues, undefined, DreamFormInput>({
    resolver: zodResolver(dreamFormInputSchema),
    defaultValues: {
      title: dream?.title ?? '',
      description: dream?.description ?? '',
      dreamDate: dream?.dreamDate ?? '',
      rating: dream?.rating,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    clearErrors();
    setFormError(undefined);

    const formData = new FormData();
    formData.set('title', values.title);
    formData.set('description', values.description);
    formData.set('dreamDate', values.dreamDate);
    formData.set('rating', String(values.rating));

    const state = await action(formData);

    if (state.fieldErrors) {
      Object.entries(state.fieldErrors).forEach(([field, messages]) => {
        const message = messages?.[0];

        if (message) {
          setError(field as keyof DreamFormInput, {
            type: 'server',
            message,
          });
        }
      });
    }

    setFormError(state.formError);
  });

  return (
    <Form onSubmit={onSubmit} noValidate>
      <Form.Field>
        <Label htmlFor="title">Название</Label>
        <Input
          id="title"
          type="text"
          placeholder=""
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? 'title-error' : undefined}
          {...register('title')}
        />
        {errors.title && (
          <p id="title-error" className={styles.error}>
            {errors.title.message}
          </p>
        )}
      </Form.Field>

      <Form.Field>
        <Label htmlFor="description">Сон</Label>
        <TextArea
          id="description"
          placeholder="Запиши все, что помнишь..."
          rows={12}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={
            errors.description ? 'description-error' : undefined
          }
          {...register('description')}
        />
        {errors.description && (
          <p id="description-error" className={styles.error}>
            {errors.description.message}
          </p>
        )}
      </Form.Field>

      <div className={styles.grid}>
        <Form.Field>
          <Label htmlFor="dreamDate">Дата</Label>
          <Input
            id="dreamDate"
            type="date"
            aria-invalid={Boolean(errors.dreamDate)}
            aria-describedby={errors.dreamDate ? 'dreamDate-error' : undefined}
            {...register('dreamDate')}
          />
          {errors.dreamDate && (
            <p id="dreamDate-error" className={styles.error}>
              {errors.dreamDate.message}
            </p>
          )}
        </Form.Field>

        <Form.Field>
          <Label htmlFor="rating">Оценка</Label>
          <Input
            id="rating"
            type="number"
            min="1"
            max="10"
            placeholder="1-10"
            aria-invalid={Boolean(errors.rating)}
            aria-describedby={errors.rating ? 'rating-error' : undefined}
            {...register('rating')}
          />
          {errors.rating && (
            <p id="rating-error" className={styles.error}>
              {errors.rating.message}
            </p>
          )}
        </Form.Field>
      </div>

      {formError && (
        <p role="alert" className={styles.formError}>
          {formError}
        </p>
      )}

      <Form.Field className={styles.actions} horizontal>
        <Button asChild variant="outline" className={styles.button}>
          <Link href="/dreams" className={styles.cancelLink}>
            Отмена
          </Link>
        </Button>

        <Button disabled={isSubmitting} className={styles.button}>
          {isSubmitting ? 'Сохраняем…' : isEdit ? 'Сохранить' : 'Создать'}
        </Button>
      </Form.Field>
    </Form>
  );
}
