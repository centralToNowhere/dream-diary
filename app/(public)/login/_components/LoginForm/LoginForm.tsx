"use client";

import { SubmitEvent, useState } from "react";
import { useRouter } from "next/navigation";
import loginRequest, {
  LoginRequestError,
} from "@/features/auth/loginRequest";
import { Button, Form, Input, Label, Notification } from "@/_components/ui";
import styles from './LoginForm.module.css';

type LoginFormProps = {
  showSessionExpiredWarning?: boolean;
};

const LoginForm = ({ showSessionExpiredWarning = false }: LoginFormProps) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);

    try {
      await loginRequest({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      });

      router.push("/dreams");
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof LoginRequestError
          ? requestError.message
          : "Не удалось войти. Попробуйте ещё раз",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className={styles.form}>
      {showSessionExpiredWarning ? (
        <Form.Field>
          <Notification variant="warn">
            Сессия завершена. Войдите снова.
          </Notification>
        </Form.Field>
      ) : null}

      <Form.Field>
        <Label htmlFor="email">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </Form.Field>

      <Form.Field>
        <Label htmlFor="password">
          Пароль
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
        />
      </Form.Field>

      {error ? (
        <Form.Field>
          <Notification variant="danger" role="alert">
            {error}
          </Notification>
        </Form.Field>
      ) : null}

      <Form.Field>
        <Button
          type="submit"
          variant="outline"
          disabled={isPending}
          className={styles.submitButton}
        >
          {isPending ? "Вход…" : "Войти"}
        </Button>
      </Form.Field>
    </Form>
  )
}

export default LoginForm;
