import { UserProfile } from "@/entities/users/types"
import { cache } from "react"
import cookiesUtils from "./cookies/cookiesUtils"
import { getUserFromRequest } from "./userDataHeader"
import { parseJWT } from "@/features/auth/jwt"

const getCurrentUser = cache(async (): Promise<UserProfile | null> => {
  const requestUser = await getUserFromRequest();

  if (requestUser) {
    return requestUser;
  }

  const jwt = await cookiesUtils.getJWT();

  if (!jwt) {
    return null;
  }

  return parseJWT(jwt);
})

export const getSessionByToken = async (jwt: string): Promise<UserProfile | null> => {
  if (!jwt) {
    return null;
  }

  return parseJWT(jwt);
}

export default getCurrentUser;
