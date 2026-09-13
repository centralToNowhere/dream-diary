import { Fragment } from 'react';
import loginRequired from '@/lib/entities/users/loginRequired';
import ProfileForm from './_components/ProfileForm';
import PageHeader from '@/_components/PageHeader';

export default async function ProfilePage() {
  await loginRequired();

  return (
    <Fragment>
      <PageHeader
        title="Профиль"
        description="Имя пользователя и email вашего аккаунта."
      />

      <ProfileForm />
    </Fragment>
  );
}
