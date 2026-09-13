import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

const useTheme = () => {
  const theme = useContext(ThemeContext);

  if (!theme) {
    throw new Error('theme is not available outside of ThemeProvider');
  }

  return theme;
};

export default useTheme;
