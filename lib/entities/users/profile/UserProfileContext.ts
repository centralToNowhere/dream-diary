'use client';

import { createContext } from 'react';
import type UserProfileStore from './UserProfileStore';

const UserProfileContext = createContext<UserProfileStore | null>(null);
export default UserProfileContext;
