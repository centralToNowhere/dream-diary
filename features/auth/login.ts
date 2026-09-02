import { LoginUserInput, LoginUserResultDTO } from "@/entities/users/types";
import { getUserDataByEmail } from "@/entities/users/repository";
import { verifyPassword } from "@/entities/users/hashUtils";
import { createSession } from "@/entities/sessions/repository";

const login = async ({ email, password }: LoginUserInput): Promise<LoginUserResultDTO | null> => {
  const userData = await getUserDataByEmail(email);

  if (!userData) {
    return null;
  }

  const isValidPassword = await verifyPassword(userData?.password_hash, password);

  if (!isValidPassword) {
    return null;
  }

  const sessionData = await createSession(userData);

  if (!sessionData) {
    return null;
  }

  return {
    jwt: sessionData.jwt,
    jwtExpires: sessionData.jwtExpires,
    refreshToken: sessionData.refreshToken,
    refreshTokenExpires: sessionData.refreshTokenExpires
  };
}

export default login;