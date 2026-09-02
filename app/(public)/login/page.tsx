import Link from "next/link";
import LoginForm from "./_components/LoginForm/LoginForm";
import styles from "./page.module.css"

type LoginPageProps = {
  searchParams: Promise<{
    "session-expired"?: string;
  }>;
};

const LoginPage = async ({ searchParams }: LoginPageProps) => {
  const params = await searchParams;
  const isSessionExpired = params["session-expired"] === "true";

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Войти в свой дневник
        </h1>
      </div>

      <LoginForm showSessionExpiredWarning={isSessionExpired} />

      <div className={styles.register}>
        <Link href="/register">Зарегистрироваться</Link>
      </div>
    </div>
  )
}

export default LoginPage;
