import { useContext } from 'react';
import UserPreferencesContext from './UserPreferencesContext';

const useUserPreferencesStore = () => {
  const store = useContext(UserPreferencesContext);

  if (!store) {
    throw new Error(
      'user preferences are not available outside of UserPreferencesProvider',
    );
  }

  return store;
};

export default useUserPreferencesStore;
