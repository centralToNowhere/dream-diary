'use client';

import { useActionState } from 'react';
import registerAction, {
  type RegisterState,
} from '@/lib/features/users/actions/registerAction';
import { Button, Form, Input, Label, Notification } from '@/_components/ui';
import styles from './RegisterForm.module.css';

export const initialRegisterState: RegisterState = {
  error: null,
  success: false,
};

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialRegisterState,
  );

  return (
    <Form action={formAction} className={styles.form}>
      <Form.Field>
        <Label htmlFor="name">Имя пользователя</Label>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="username"
          minLength={3}
          maxLength={50}
          required
          placeholder=""
        />
      </Form.Field>

      <Form.Field>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </Form.Field>

      <Form.Field>
        <Label htmlFor="password">Пароль</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          placeholder="Не менее 8 символов"
        />
      </Form.Field>

      <Form.Field>
        <Label htmlFor="passwordConfirm">Повтори пароль</Label>
        <Input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </Form.Field>

      {state.error ? (
        <Form.Field>
          <Notification variant="danger" role="alert">
            {state.error}
          </Notification>
        </Form.Field>
      ) : null}

      {state.success ? (
        <Form.Field>
          <Notification variant="success">
            Аккаунт создан. Теперь можно войти.
          </Notification>
        </Form.Field>
      ) : null}

      <Form.Field>
        <Button
          type="submit"
          variant="outline"
          disabled={isPending}
          className={styles.submitButton}
        >
          {isPending ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
        </Button>
      </Form.Field>
    </Form>
  );
}
