import { userAuthScheme } from '@/lib/entities/users/types';
import { z } from 'zod';

export const userJWTPayloadScheme = userAuthScheme.extend({
  exp: z.number().int().positive(),
  sId: z.number(),
  jti: z.string(),
});

export type UserJWTPayload = z.infer<typeof userJWTPayloadScheme>;
