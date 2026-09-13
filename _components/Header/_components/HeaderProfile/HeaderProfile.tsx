'use client';

import styles from './HeaderProfile.module.css';
import { UserCircle, LogOut, LoaderCircle, UserCog } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import DropdownMenu, { DropDownMenuItem } from '@/_components/ui/DropdownMenu';
import Button from '@/_components/ui/Button';
import Image from 'next/image';
import Link from 'next/link';
import logoutRequest from '@/lib/features/auth/logoutRequest';

type HeaderProfileProps = {
  userName: string;
  email: string;
  avatarUrl: string | null;
};

const USERNAME_PLACEHOLDER = 'Аноним';

const HeaderProfile = ({ userName, email, avatarUrl }: HeaderProfileProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutRequest();

      router.replace('/login');
      router.refresh();
    });
  };

  const menuItems: DropDownMenuItem[] = [
    {
      node: (
        <Link href="/profile" className={styles.profileMenuItem}>
          <span>Профиль</span>
          <UserCog />
        </Link>
      ),
      id: 'profile',
    },
    {
      node: (
        <div className={styles.profileMenuItem}>
          <span>Выйти</span>
          {isPending ? <LoaderCircle /> : <LogOut />}
        </div>
      ),
      id: 'logout',
      onSelect: handleLogout,
    },
  ];

  return (
    <DropdownMenu
      items={menuItems}
      contentCls={styles.profileMenuPopupContent}
      trigger={
        <Button tabIndex={0} className={styles.headerProfileButtonContent}>
          <div className={styles.headerProfileButtonData}>
            <span className={styles.headerProfileName}>
              {userName ?? USERNAME_PLACEHOLDER}
            </span>
            <span className={styles.headerProfileEmail}>{email}</span>
          </div>
          <div className={styles.headerProfileAvatarContainer}>
            {avatarUrl ? (
              <Image src={avatarUrl} alt="" width={32} height={32} />
            ) : (
              <UserCircle />
            )}
          </div>
        </Button>
      }
    />
  );
};

export default HeaderProfile;
