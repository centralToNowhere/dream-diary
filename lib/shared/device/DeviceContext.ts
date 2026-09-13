'use client';

import { createContext } from 'react';
import { type DeviceType } from './types';

type DeviceContextValue = {
  device: DeviceType;
};

const DeviceContext = createContext<DeviceContextValue | null>(null);

export { DeviceContext };
