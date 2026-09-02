import "server-only";

import { refreshSession } from "@/entities/sessions/repository";
import type { SessionRefreshResponse } from "@/entities/sessions/types";

type RefreshPromise = Promise<SessionRefreshResponse | null>;

export const refreshByToken = function (token: string): RefreshPromise {
  if (!token) {
    return Promise.resolve(null);
  }

  return refreshSession(token);
};
