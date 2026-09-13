'use client';

import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { useUserProfileStore } from '@/lib/entities/users/profile';
import { Button, Form, Input, Label, Notification } from '@/_components/ui';
import styles from '../page.module.css';

const ProfileForm = observer(function ProfileForm() {
  const store = useUserProfileStore();

  if (!store.profile && store.isLoading) {
    return <p role="status">Загрузка профиля…</p>;
  }

  if (!store.profile) {
    return (
      <div>
        <Notification variant="warn">
          {store.error ?? 'Профиль недоступен. Войдите в аккаунт.'}
        </Notification>
        <div className={styles.actions}>
          <Button
            type="button"
            variant="outline"
            disabled={store.isLoading}
            onClick={() => void store.reload()}
          >
            {store.isLoading ? 'Загрузка…' : 'Попробовать снова'}
          </Button>
          <Link href="/login">Войти</Link>
        </div>
      </div>
    );
  }

  return (
    <Form
      aria-label="Редактирование профиля"
      aria-busy={store.isSaving}
      onSubmit={(event) => {
        event.preventDefault();
        void store.save();
      }}
    >
      <Form.Field>
        <Label htmlFor="profile-name">Имя пользователя</Label>
        <Input
          id="profile-name"
          name="name"
          autoComplete="username"
          required
          minLength={3}
          maxLength={50}
          value={store.name}
          disabled={store.isSaving}
          onChange={(event) => store.setName(event.target.value)}
        />
      </Form.Field>
      <Form.Field>
        <Label htmlFor="profile-email">Email</Label>
        <Input
          id="profile-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-describedby="profile-email-hint"
          value={store.email}
          disabled={store.isSaving}
          onChange={(event) => store.setEmail(event.target.value)}
        />
        <p id="profile-email-hint" className={styles.hint}>
          После сохранения используйте новый email для входа.
        </p>
      </Form.Field>
      {store.error && (
        <Form.Field>
          <Notification variant="danger" role="alert">
            {store.error}
          </Notification>
        </Form.Field>
      )}
      {store.saved && (
        <Form.Field>
          <Notification variant="success">Профиль сохранён.</Notification>
        </Form.Field>
      )}
      <Form.Field>
        <div className={styles.actions}>
          <Button type="submit" disabled={store.isSaving || !store.isDirty}>
            {store.isSaving ? 'Сохранение…' : 'Сохранить'}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={store.isSaving || !store.isDirty}
            onClick={store.resetDraft}
          >
            Отменить
          </Button>
        </div>
      </Form.Field>
    </Form>
  );
});

export default ProfileForm;
