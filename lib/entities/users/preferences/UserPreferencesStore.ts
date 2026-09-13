import type {
  PreferencesTheme,
  UserPreferences,
  UpdateUserPreferencesResult,
} from './types';
import { makeAutoObservable } from 'mobx';
import { isPreferencesTheme } from './types';
import { debounce } from '@/lib/shared/functions';

export interface PreferencesStoreInitialData {
  theme: PreferencesTheme | null | undefined;
}

class UserPreferencesStore {
  theme: PreferencesTheme;
  private hasLocalChoice = false;
  private canSave: boolean;
  private disposed = false;
  saveTheme: () => void;
  dispose: () => void;

  constructor(
    initialData: PreferencesStoreInitialData | undefined,
    savePreferences: (
      preferences: UserPreferences,
    ) => Promise<UpdateUserPreferencesResult>,
  ) {
    this.canSave = initialData != null;
    const initialTheme = initialData?.theme;
    this.theme =
      initialTheme && isPreferencesTheme(initialTheme) ? initialTheme : 'light';

    const saveThemeDebounced = debounce((theme: PreferencesTheme) => {
      void savePreferences({ theme }).catch((error: unknown) => {
        console.error('Не удалось сохранить настройки', error);
      });
    }, 500);

    this.saveTheme = () => {
      if (!this.disposed && this.canSave) saveThemeDebounced(this.theme);
    };

    this.dispose = () => {
      this.disposed = true;
      saveThemeDebounced.cancel();
    };

    makeAutoObservable(this);
  }

  setTheme = (theme: PreferencesTheme) => {
    if (!this.disposed && isPreferencesTheme(theme)) {
      this.hasLocalChoice = true;
      this.theme = theme;
      this.saveTheme();
    }
  };

  applySystemTheme = () => {
    if (!this.disposed && !this.hasLocalChoice) {
      this.theme = this.checkPreferColorSchema();
    }
  };

  applyPreferences = (preferences: PreferencesStoreInitialData | null) => {
    if (this.disposed) return;
    this.canSave = preferences != null;
    if (this.hasLocalChoice) {
      this.saveTheme();
    } else if (preferences?.theme && isPreferencesTheme(preferences.theme)) {
      this.theme = preferences.theme;
    }
  };

  reset() {
    this.theme = this.checkPreferColorSchema();
  }

  checkPreferColorSchema = (): PreferencesTheme => {
    if (typeof window === 'undefined') {
      return 'light';
    }

    const colorSchemeDark = window.matchMedia('(prefers-color-scheme: dark)');

    return colorSchemeDark.matches ? 'dark' : 'light';
  };
}

export default UserPreferencesStore;
