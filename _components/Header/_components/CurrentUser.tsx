'use client';

import { observer } from 'mobx-react-lite';
import { useUserProfileStore } from '@/lib/entities/users/profile';
import HeaderProfile from './HeaderProfile';

const CurrentUser = observer(function CurrentUser() {
  const { profile } = useUserProfileStore();

  if (!profile) {
    return null;
  }

  return (
    <HeaderProfile
      userName={profile.name}
      email={profile.email}
      avatarUrl={profile.avatarUrl ?? null}
    />
  );
});

export default CurrentUser;
