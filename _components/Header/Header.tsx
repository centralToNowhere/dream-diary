import { Suspense } from 'react';
import styles from './Header.module.css';

import CurrentUser from './_components/CurrentUser';
import HeaderMenu from './_components/HeaderMenu';

export default function Header() {
  return (
    <header className={styles.header}>
      <HeaderMenu />
      <div className={styles.headerSidebar}>
        <Suspense fallback={null}>
          <CurrentUser />
        </Suspense>
      </div>
    </header>
  );
}
