import "server-only";

import { headers } from "next/headers";
import { cache } from "react";
import {
  UserProfileSchema,
  type UserProfile,
} from "@/entities/users/types";

export const USER_DATA_HEADER = "x-user-data";

export const serializeUserData = (user: UserProfile) => (
  Buffer.from(JSON.stringify(user), "utf8").toString("base64url")
);

export const deserializeUserData = (value?: string | null): UserProfile | null => {
  if (!value) {
    return null;
  }

  try {
    const json = Buffer.from(value, "base64url").toString("utf8");
    const result = UserProfileSchema.safeParse(JSON.parse(json));

    return result.success ? result.data : null;
  } catch {
    return null;
  }
};

export const getUserFromRequest = cache(async () => {
  const requestHeaders = await headers();

  return deserializeUserData(requestHeaders.get(USER_DATA_HEADER));
});
