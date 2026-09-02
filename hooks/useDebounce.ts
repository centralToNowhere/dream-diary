import { useCallback, useEffect, useRef } from "react";

const useDebounce = <TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay: number,
) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, []);

  return useCallback((...args: TArgs) => {

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback.apply(null, args);
    }, delay)
  }, [callback, delay]);
}

export default useDebounce;