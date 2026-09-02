import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { deleteSession } from "@/entities/sessions/repository";
import cookiesUtils from "@/features/auth/cookies/cookiesUtils";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (refreshToken) {
    await deleteSession(refreshToken);
  }

  await cookiesUtils.removeJWT();
  await cookiesUtils.removeRefreshToken();

  return NextResponse.json({ success: true });
}