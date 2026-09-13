import { NextResponse, type NextRequest } from 'next/server';
import getUserPreferences from '@/lib/features/users/getUserPreferences';
import hasSessionCookies from '@/lib/shared/auth/hasSessionCookies';

export async function GET(request: NextRequest) {
  const preferences = await getUserPreferences();

  if (!preferences && hasSessionCookies(request)) {
    return NextResponse.json(
      { error: 'Требуется обновление сессии' },
      {
        status: 401,
        headers: { 'Cache-Control': 'private, no-store' },
      },
    );
  }

  return NextResponse.json(preferences, {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
