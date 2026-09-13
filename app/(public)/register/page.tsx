import Link from 'next/link';
import RegisterForm from './_components/RegisterForm';
import styles from './page.module.css';

export default function RegisterPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Создать аккаунт</h1>
        <p className={styles.description}>
          Зарегистрируйся, чтобы сохранять сны в личном дневнике.
        </p>
      </div>

      <RegisterForm />

      <div className={styles.toLogin}>
        <Link href="/login">Войти</Link>
      </div>
    </div>
  );
}
