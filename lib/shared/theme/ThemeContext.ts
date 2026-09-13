'use client';

import { createContext } from 'react';
import type { Theme } from './types';

const ThemeContext = createContext<Theme | null>(null);

export { ThemeContext };
