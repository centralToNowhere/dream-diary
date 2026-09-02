import { RefObject, useEffect } from "react"

type UseParalaxFunction = (
  paralaxConfig: {
    keyX: string
    keyY: string
  },
  elementRef: RefObject<HTMLDivElement | null>
) => (e: React.MouseEvent<HTMLElement, MouseEvent>) => void

const movementRange = 36;

const useParalax: UseParalaxFunction = ({ keyX, keyY }, elementRef) => {
  const paralax = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (!elementRef.current) {
      return;
    }

    const rect = elementRef.current.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercentage = (x / rect.width - 0.5) * movementRange;
    const yPercentage = (y / rect.height - 0.5) * movementRange;

    elementRef.current.style.setProperty(keyX, `${xPercentage}%`);
    elementRef.current.style.setProperty(keyY, `${yPercentage}%`);
  }

  return paralax;
}

export default useParalax