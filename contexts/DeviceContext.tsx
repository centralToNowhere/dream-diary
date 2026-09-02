"use client";

import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type DeviceType = "mobile" | "tablet" | "desktop";

type DeviceContextValue = {
  device: DeviceType;
};

const MOBILE_MAX_WIDTH = 768;
const TABLET_MAX_WIDTH = 992;

const getDeviceType = (width: number): DeviceType => {
  if (width <= MOBILE_MAX_WIDTH) {
    return "mobile";
  }

  if (width <= TABLET_MAX_WIDTH) {
    return "tablet";
  }

  return "desktop";
};

const DeviceContext = createContext<DeviceContextValue | null>(null);

type DeviceProviderProps = {
  children: ReactNode;
};

const DeviceProvider = ({ children }: DeviceProviderProps) => {
  const [device, setDevice] = useState<DeviceType>("desktop");

  useEffect(() => {
    const updateDevice = () => {
      setDevice(getDeviceType(window.innerWidth));
    };

    updateDevice();
    window.addEventListener("resize", updateDevice);

    return () => window.removeEventListener("resize", updateDevice);
  }, []);

  const value = useMemo(() => ({ device }), [device]);

  return (
    <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
  );
};

export {
  DeviceContext,
  DeviceProvider,
  getDeviceType,
  type DeviceContextValue,
  type DeviceType,
};
