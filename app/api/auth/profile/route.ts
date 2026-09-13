import { loginRequiredApi } from '@/lib/entities/users/loginRequired';
import { NextResponse } from 'next/server';

export const GET = async () => {
  const profile = await loginRequiredApi();

  return NextResponse.json(profile);
};
