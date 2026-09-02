"use client";

import { useContext } from "react";
import { DeviceContext } from "@/contexts";

type DeviceMatchMap = {
  isMobile: boolean,
  isTablet: boolean,
  isDesktop: boolean
}

const useDevice = (): DeviceMatchMap => {
  const context = useContext(DeviceContext);

  if (!context) {
    throw new Error("useDevice is not available outside of DeviceProvider");
  }

  return {
    isDesktop: context.device === 'desktop',
    isTablet: context.device === 'tablet',
    isMobile: context.device === 'mobile'
  };
};

export default useDevice;
