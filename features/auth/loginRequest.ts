import { LoginUserInput } from "@/entities/users/types";

type LoginResponse = {
  success: true;
};

type LoginErrorResponse = {
  error?: string;
};

export class LoginRequestError extends Error {}

const loginRequest = async (
  credentials: LoginUserInput,
): Promise<LoginResponse> => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  const result = (await response.json()) as LoginResponse | LoginErrorResponse;

  if (!response.ok) {
    const message =
      "error" in result ? result.error : undefined;

    throw new LoginRequestError(message ?? "Не удалось войти");
  }

  return result as LoginResponse;
};

export default loginRequest;
