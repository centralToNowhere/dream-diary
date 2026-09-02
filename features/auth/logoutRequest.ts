export class LogoutRequestError extends Error {}

const logoutRequest = async (): Promise<void> => {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new LogoutRequestError("Не удалось выйти из аккаунта");
  }
};

export default logoutRequest;
