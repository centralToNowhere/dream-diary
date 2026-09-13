import type { ReactNode } from 'react';
import styles from './PageHeader.module.css';

type PageHeaderProps = {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
};

export default function PageHeader({
  title,
  description,
  children,
}: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <div>
        <h1 className={styles.title}>{title}</h1>
        {description && (
          <span className={styles.description}>{description}</span>
        )}
      </div>
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  );
}
