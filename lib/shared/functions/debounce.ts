const debounce = <T extends unknown[]>(
  fn: (...args: T) => void,
  delay: number,
) => {
  let timeout: ReturnType<typeof setTimeout>;

  const debounced = (...args: T) => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      fn(...args);
    }, delay);
  };

  debounced.cancel = () => clearTimeout(timeout);

  return debounced;
};

export default debounce;
