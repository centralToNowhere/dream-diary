import "server-only";

import { redirect, unauthorized } from "next/navigation";
import cookiesUtils from "./cookies/cookiesUtils";
import getCurrentUser from "./getUserProfile";
import { SESSION_EXPIRED_URL, LOGIN_ROUTE } from "@/app/routes";
import type { UserProfile } from "@/entities/users/types";

type VerifySessionResult = {
  result: "success";
  profile: UserProfile;
} | {
  result: "failure";
  reason: "missing" | "invalid";
};

const verifySession = async (): Promise<VerifySessionResult> => {
  const [accessToken, refreshToken] = await Promise.all([
    cookiesUtils.getJWT(),
    cookiesUtils.getRefreshToken(),
  ]);

  if (!accessToken && !refreshToken) {
    return {
      result: "failure",
      reason: "missing",
    };
  }

  if (accessToken) {
    const user = await getCurrentUser();

    if (user) {
      return {
        result: "success",
        profile: user,
      };
    }
  }

  return {
    result: "failure",
    reason: "invalid",
  };
};

export const loginRequiredApi = async () => {
  const result = await verifySession();

  if (result.result === "success") {
    return result.profile;
  }

  if (result.reason === "invalid") {
    await cookiesUtils.removeJWT();
  }

  unauthorized();
};

const loginRequired = async () => {
  const result = await verifySession();

  if (result.result === "success") {
    return result.profile;
  }

  return redirect(
    result.reason === "invalid" ? SESSION_EXPIRED_URL : LOGIN_ROUTE,
  );
};

export default loginRequired;
