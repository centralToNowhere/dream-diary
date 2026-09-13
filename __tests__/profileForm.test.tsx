import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import ProfileForm from '@/app/(private)/profile/_components/ProfileForm';
import CurrentUser from '@/_components/Header/_components/CurrentUser';
import UserProfileStore from '@/lib/entities/users/profile/UserProfileStore';
import UserProfileProvider from '@/lib/providers/store/user/profile/UserProfileProvider';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn(), refresh: jest.fn() }),
}));

afterEach(cleanup);

const profile = {
  id: 4,
  name: 'Old name',
  email: 'old@example.com',
  roleName: { type: 'user' as const, title: 'User' },
  avatarUrl: null,
};

it('updates the form and header together only after saving succeeds', async () => {
  const save = jest
    .fn()
    .mockResolvedValue({
      ...profile,
      name: 'New name',
      email: 'new@example.com',
    });
  const store = new UserProfileStore(profile, save, jest.fn());
  render(
    <UserProfileProvider storeInstance={store}>
      <CurrentUser />
      <ProfileForm />
    </UserProfileProvider>,
  );
  fireEvent.change(screen.getByLabelText('Имя пользователя'), {
    target: { value: 'New name' },
  });
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'new@example.com' },
  });
  expect(screen.queryByText('Old name')).not.toBeNull();
  expect(screen.queryByText('New name')).toBeNull();

  await act(async () => {
    fireEvent.submit(screen.getByRole('form'));
  });
  expect(screen.queryByText('New name')).not.toBeNull();
  expect(screen.queryByText('new@example.com')).not.toBeNull();
  expect(screen.queryByText('Old name')).toBeNull();
  expect(screen.getByRole('status').textContent).toBe('Профиль сохранён.');
  expect(
    (screen.getByRole('button', { name: 'Сохранить' }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
});

it('resets a draft without sending a request', () => {
  const save = jest.fn();
  const store = new UserProfileStore(profile, save, jest.fn());
  render(
    <UserProfileProvider storeInstance={store}>
      <ProfileForm />
    </UserProfileProvider>,
  );
  fireEvent.change(screen.getByLabelText('Имя пользователя'), {
    target: { value: 'Draft' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Отменить' }));
  expect(
    (screen.getByLabelText('Имя пользователя') as HTMLInputElement).value,
  ).toBe('Old name');
  expect(save).not.toHaveBeenCalled();
});
