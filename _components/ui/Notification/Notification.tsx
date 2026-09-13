import cn from 'clsx';
import styles from './Notification.module.css';

const notificationVariantStyleMap = {
  danger: styles.danger,
  warn: styles.warn,
  success: styles.success,
};

export type NotificationVariants = keyof typeof notificationVariantStyleMap;

export interface NotificationProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: NotificationVariants;
}

const Notification = ({
  className,
  role = 'status',
  variant,
  ...props
}: NotificationProps) => (
  <div
    className={cn(
      styles.notification,
      notificationVariantStyleMap[variant],
      className,
    )}
    role={role}
    {...props}
  />
);

Notification.displayName = 'Notification';

export { Notification };
