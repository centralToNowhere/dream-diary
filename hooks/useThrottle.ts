import { useCallback, useEffect, useRef } from "react";

const useThrottle = <TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay: number,
  trailing?: boolean
) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const lastArgsRef = useRef<TArgs | null>(null);
  const blockedRef = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, []);

  return useCallback((...args: TArgs) => {
    if (blockedRef.current) {
      lastArgsRef.current = args;
      return;
    }

    callback(...args);
    blockedRef.current = true;

    timeoutRef.current = setTimeout(() => {
      blockedRef.current = false;

      if (trailing && lastArgsRef.current !== null) {
        callback(...lastArgsRef.current);
        lastArgsRef.current = null;
      }
    }, delay);
  }, [callback, delay, trailing]);
}

export default useThrottle;