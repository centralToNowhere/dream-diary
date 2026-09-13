'use client';

import { createContext } from 'react';
import UserPreferencesStore from './UserPreferencesStore';

const UserPreferencesContext = createContext<UserPreferencesStore | null>(null);

export default UserPreferencesContext;
