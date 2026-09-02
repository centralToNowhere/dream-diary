'use client';

import styles from './HeaderMenu.module.css';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import BackButton from "@/_components/Header/_components/BackButton";
import Logo from "@/_components/Logo";
import { useDevice } from '@/hooks';
import DropDownMenu, { DropDownMenuItem } from '@/_components/ui/DropdownMenu'
import { Fragment } from 'react/jsx-runtime';
import ThemeDarkLightToggle from "@/_components/ThemeToggle";

const items: DropDownMenuItem[] = [
  {
    id: "main",
    node: <Link className={styles.headerNavItem} href="/">
      <span>Главная</span>
    </Link>,
  },
  {
    id: "diary",
    node: <Link key="diary" className={styles.headerNavItem} href="/dreams">
      <span>Дневник</span>
    </Link>
  }
]

const LogoItem = () => <Link href="/" className={styles.logoItem}>
  <Logo width={"36px"} height={"36px"} />
</Link>;

const HeaderMenu = () => {
  const device = useDevice();

  const isMobileOrTablet = !device.isDesktop;

  return (
    <nav className={styles.headerNav}>
      {isMobileOrTablet && (
        <DropDownMenu
          trigger={<Menu tabIndex={0} className={styles.dropdownTrigger} />}
          label={<LogoItem />}
          items={items}
          offset={12}
          contentCls={styles.dropdownContent}
        />
      )}

      {!isMobileOrTablet && (
        <>
          <BackButton className={styles.backButton} />
          <LogoItem />
          <div className={styles.headerNavList}>
            <div className={styles.headerNavItems}>
              {items.map((item) => {
                if (item.children) {
                  return (
                    <DropDownMenu
                      key={item.id}
                      trigger={item.node}
                      items={item.children}
                    />
                  )
                }

                return <Fragment key={item.id}>
                  {item.node}
                </Fragment>;
              })}
            </div>

            <ThemeDarkLightToggle />
          </div>
        </>
      )}
    </nav>
  )
}

HeaderMenu.displayName = 'HeaderMenu';

export default HeaderMenu