import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react';
import {
  StrictMode,
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { hydrateRoot } from 'react-dom/client';
import ProfileForm from '@/app/(private)/profile/_components/ProfileForm';
import { renderToString } from 'react-dom/server';
import StoreSetup from '@/app/StoreSetup';
import disposeGlobalStores from '@/app/disposeGlobalStores';
import RootStoreProvider from '@/lib/providers/store/RootStoreProvider';
import UserPreferencesProvider from '@/lib/providers/store/user/preferences/UserPreferencesProvider';
import type {
  GlobalStores,
  StoreRegistration,
} from '@/lib/providers/store/types';
import ThemeProvider from '@/lib/providers/theme/ThemeProvider';
import ThemeToggle from '@/lib/features/users/components/ThemeToggle/ThemeToggle';
import updatePreferencesAction from '@/lib/features/users/actions/updatePreferencesAction';
import getUserPreferencesRequest from '@/lib/features/users/getUserPreferencesRequest';
import { getUserProfileRequest } from '@/lib/features/users/profileRequests';
import {
  UserPreferencesStore,
  useUserPreferencesStore,
} from '@/lib/entities/users/preferences';
import { useUserProfileStore } from '@/lib/entities/users/profile';
import { useTheme } from '@/lib/shared/theme';
import loginRequest from '@/lib/features/auth/loginRequest';
import logoutRequest from '@/lib/features/auth/logoutRequest';
import { notifySessionChange } from '@/lib/shared/auth/sessionChange';
import apiClient from '@/lib/shared/http/apiClient';

jest.mock('@/lib/shared/http/apiClient', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

jest.mock('@/lib/features/users/actions/updatePreferencesAction', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/features/users/getUserPreferencesRequest', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/features/users/profileRequests', () => ({
  getUserProfileRequest: jest.fn(),
  updateUserProfileRequest: jest.fn(),
}));

jest.mock('@/app/disposeGlobalStores', () => ({
  __esModule: true,
  default: jest.fn(jest.requireActual('@/app/disposeGlobalStores').default),
}));

const savePreferences = jest.mocked(updatePreferencesAction);
const loadPreferences = jest.mocked(getUserPreferencesRequest);
const originalMatchMedia = Object.getOwnPropertyDescriptor(
  window,
  'matchMedia',
);
const postMock = jest.mocked(apiClient.post);

const registerPreferences = (
  store: UserPreferencesStore,
): StoreRegistration<UserPreferencesStore> => ({
  store,
  provide: (children) => (
    <UserPreferencesProvider storeInstance={store}>
      {children}
    </UserPreferencesProvider>
  ),
});

beforeEach(() => {
  jest.useFakeTimers();
  jest.mocked(disposeGlobalStores).mockClear();
  savePreferences.mockReset().mockResolvedValue({ success: true });
  loadPreferences.mockReset().mockResolvedValue(null);
  jest.mocked(getUserProfileRequest).mockReset().mockResolvedValue(null);
  postMock.mockReset().mockResolvedValue({ data: { success: true } });
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: jest.fn(() => ({ matches: true })),
  });
});

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
  jest.useRealTimers();
  document.body.classList.remove('theme-light', 'theme-dark');
  if (originalMatchMedia) {
    Object.defineProperty(window, 'matchMedia', originalMatchMedia);
  } else {
    Reflect.deleteProperty(window, 'matchMedia');
  }
});

it('provides the injected store and accepts a replacement without creating its own', () => {
  const first = new UserPreferencesStore({ theme: 'light' }, savePreferences);
  const second = new UserPreferencesStore({ theme: 'dark' }, savePreferences);
  let injected = first;
  const { result, rerender } = renderHook(() => useUserPreferencesStore(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <RootStoreProvider globalStores={[registerPreferences(injected)]}>
        {children}
      </RootStoreProvider>
    ),
  });

  expect(result.current).toBe(first);
  rerender();
  expect(result.current).toBe(first);
  injected = second;
  rerender();
  expect(result.current).toBe(second);
  expect(loadPreferences).not.toHaveBeenCalled();
});

it('loads preferences once per setup and creates separate, stable stores', async () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <StoreSetup>{children}</StoreSetup>
  );
  const first = renderHook(() => useUserPreferencesStore(), { wrapper });
  const second = renderHook(() => useUserPreferencesStore(), { wrapper });
  expect(first.result.current).not.toBeNull();
  await act(async () => {});
  const store = first.result.current;

  first.rerender();
  expect(first.result.current).toBe(store);
  expect(second.result.current).not.toBe(store);
  act(() => store.setTheme('light'));
  expect(second.result.current.theme).toBe('dark');
  expect(loadPreferences).toHaveBeenCalledTimes(2);
});

it('uses fetched preferences before the system theme without saving on mount', async () => {
  loadPreferences.mockResolvedValue({ theme: 'light' });
  const { result } = renderHook(() => useUserPreferencesStore(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <StoreSetup>{children}</StoreSetup>
    ),
  });

  await act(async () => {});
  expect(result.current.theme).toBe('light');
  act(() => jest.runAllTimers());
  expect(savePreferences).not.toHaveBeenCalled();
});

it('propagates system theme, store changes, and toggle clicks without saving for guests', async () => {
  let preferences: ReturnType<typeof useUserPreferencesStore>;
  function ThemeValue() {
    const store = useUserPreferencesStore();
    useEffect(() => {
      preferences = store;
    }, [store]);
    return <output data-testid="theme">{useTheme()}</output>;
  }

  render(
    <StoreSetup>
      <ThemeProvider>
        <ThemeValue />
        <ThemeToggle />
      </ThemeProvider>
    </StoreSetup>,
  );

  await act(async () => {});
  expect(screen.getByTestId('theme').textContent).toBe('dark');
  expect(document.body.classList.contains('theme-dark')).toBe(true);

  act(() => preferences.setTheme('light'));
  expect(screen.getByTestId('theme').textContent).toBe('light');
  expect(document.body.classList.contains('theme-light')).toBe(true);
  expect(document.body.classList.contains('theme-dark')).toBe(false);

  fireEvent.click(screen.getByRole('button'));
  expect(screen.getByTestId('theme').textContent).toBe('dark');
  expect(document.body.classList.contains('theme-light')).toBe(false);
  expect(document.body.classList.contains('theme-dark')).toBe(true);
  act(() => jest.runAllTimers());
  expect(savePreferences).not.toHaveBeenCalled();
});

it('debounces saving the latest choice inside an injected store', async () => {
  const store = new UserPreferencesStore({ theme: 'light' }, savePreferences);
  const { result } = renderHook(() => useUserPreferencesStore(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <RootStoreProvider globalStores={[registerPreferences(store)]}>
        {children}
      </RootStoreProvider>
    ),
  });

  act(() => result.current.setTheme('dark'));
  act(() => jest.advanceTimersByTime(300));
  act(() => result.current.setTheme('light'));
  act(() => jest.advanceTimersByTime(499));
  expect(savePreferences).not.toHaveBeenCalled();
  await act(async () => {
    jest.advanceTimersByTime(1);
  });
  expect(savePreferences).toHaveBeenCalledTimes(1);
  expect(savePreferences).toHaveBeenCalledWith({ theme: 'light' });
  expect(loadPreferences).not.toHaveBeenCalled();
});

it('connects persistence after loading authenticated preferences', async () => {
  loadPreferences.mockResolvedValue({ theme: 'light' });
  const { result } = renderHook(() => useUserPreferencesStore(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <StoreSetup>{children}</StoreSetup>
    ),
  });
  await act(async () => {});
  act(() => result.current.setTheme('dark'));
  await act(async () => {
    jest.advanceTimersByTime(500);
  });
  expect(savePreferences).toHaveBeenCalledWith({ theme: 'dark' });
});

it('renders with system preferences if the initial request fails', async () => {
  loadPreferences.mockRejectedValue(new Error('Request failed'));
  jest.spyOn(console, 'error').mockImplementation(() => {});
  const { result } = renderHook(() => useUserPreferencesStore(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <StoreSetup>{children}</StoreSetup>
    ),
  });
  await act(async () => {});
  expect(result.current.theme).toBe('dark');
  expect(savePreferences).not.toHaveBeenCalled();
});

it('reloads stores after login and logout without remounting StoreSetup', async () => {
  const { result } = renderHook(() => useUserPreferencesStore(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <StoreSetup>{children}</StoreSetup>
    ),
  });
  await act(async () => {});
  const guestStore = result.current;

  loadPreferences.mockResolvedValue({ theme: 'light' });
  await act(async () => {
    await loginRequest({ email: 'user@example.com', password: 'password' });
  });
  expect(result.current).not.toBe(guestStore);
  expect(result.current.theme).toBe('light');
  act(() => result.current.setTheme('dark'));
  await act(async () => {
    jest.advanceTimersByTime(500);
  });
  expect(savePreferences).toHaveBeenCalledWith({ theme: 'dark' });

  savePreferences.mockClear();
  loadPreferences.mockResolvedValue(null);
  await act(async () => {
    await logoutRequest();
  });
  act(() => result.current.setTheme('light'));
  await act(async () => {
    jest.advanceTimersByTime(500);
  });
  expect(savePreferences).not.toHaveBeenCalled();
  expect(loadPreferences).toHaveBeenCalledTimes(3);
});

it('keeps the current stores when login or logout fails', async () => {
  const { result } = renderHook(() => useUserPreferencesStore(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <StoreSetup>{children}</StoreSetup>
    ),
  });
  await act(async () => {});
  const store = result.current;
  postMock.mockRejectedValue(new Error('Failed'));

  await act(async () => {
    await expect(
      loginRequest({ email: 'user@example.com', password: 'wrong' }),
    ).rejects.toThrow();
    await expect(logoutRequest()).rejects.toThrow();
  });
  expect(result.current).toBe(store);
  expect(loadPreferences).toHaveBeenCalledTimes(1);
});

it('initializes and clears the profile with the rest of the session stores', async () => {
  const { result } = renderHook(() => useUserProfileStore(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <StoreSetup>{children}</StoreSetup>
    ),
  });
  await act(async () => {});
  expect(result.current.profile).toBeNull();

  const profile = {
    id: 4,
    name: 'Dmitry',
    email: 'user@example.com',
    roleName: { type: 'user' as const, title: 'User' },
  };
  jest.mocked(getUserProfileRequest).mockResolvedValue(profile);
  await act(async () => {
    await loginRequest({ email: profile.email, password: 'password' });
  });
  const authenticatedStore = result.current;
  expect(authenticatedStore.profile).toEqual(profile);
  act(() => authenticatedStore.setName('Draft'));

  jest.mocked(getUserProfileRequest).mockResolvedValue(null);
  await act(async () => {
    await logoutRequest();
  });
  expect(result.current).not.toBe(authenticatedStore);
  expect(result.current.profile).toBeNull();
  expect(authenticatedStore.profile).toBeNull();
  expect(authenticatedStore.name).toBe('');
});

it("ignores a previous session's response and unsubscribes on unmount", async () => {
  let resolvePrevious!: (value: { theme: 'light' }) => void;
  loadPreferences.mockReturnValueOnce(
    new Promise((resolve) => {
      resolvePrevious = resolve;
    }),
  );
  const { result, unmount } = renderHook(() => useUserPreferencesStore(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <StoreSetup>{children}</StoreSetup>
    ),
  });

  await act(async () => {
    notifySessionChange();
  });
  const currentStore = result.current;
  expect(currentStore.theme).toBe('dark');
  await act(async () => {
    resolvePrevious({ theme: 'light' });
  });
  expect(result.current).toBe(currentStore);
  expect(disposeGlobalStores).toHaveBeenCalledWith(
    expect.arrayContaining([
      expect.objectContaining({
        store: expect.objectContaining({ theme: 'dark' }),
      }),
    ]),
  );

  unmount();
  expect(disposeGlobalStores).toHaveBeenLastCalledWith(
    expect.arrayContaining([expect.objectContaining({ store: currentStore })]),
  );
  notifySessionChange();
  expect(loadPreferences).toHaveBeenCalledTimes(2);
});

it('очищает старые хранилища и сохраняет содержимое при смене сессии', async () => {
  loadPreferences.mockResolvedValue({ theme: 'light' });
  const { result } = renderHook(() => useUserPreferencesStore(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <StoreSetup>
        <span>Store consumer</span>
        {children}
      </StoreSetup>
    ),
  });
  await act(async () => {});
  const oldStore = result.current;
  act(() => oldStore.setTheme('dark'));

  let resolveNext!: (value: null) => void;
  loadPreferences.mockImplementationOnce(() => {
    expect(disposeGlobalStores).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ store: oldStore })]),
    );
    return new Promise((resolve) => {
      resolveNext = resolve;
    });
  });
  act(() => {
    notifySessionChange();
  });
  expect(screen.queryByText('Store consumer')).not.toBeNull();
  await act(async () => {
    jest.advanceTimersByTime(500);
  });
  expect(savePreferences).not.toHaveBeenCalled();

  await act(async () => {
    resolveNext(null);
  });
  expect(screen.queryByText('Store consumer')).not.toBeNull();
  expect(result.current).not.toBe(oldStore);
});

it('disposes stores that finish loading after unmount', async () => {
  let resolvePreferences!: (value: { theme: 'light' }) => void;
  loadPreferences.mockReturnValueOnce(
    new Promise((resolve) => {
      resolvePreferences = resolve;
    }),
  );
  const { unmount } = render(
    <StoreSetup>
      <span>Store consumer</span>
    </StoreSetup>,
  );
  unmount();

  await act(async () => {
    resolvePreferences({ theme: 'light' });
  });
  expect(disposeGlobalStores).toHaveBeenCalledTimes(1);
  expect(disposeGlobalStores).toHaveBeenCalledWith(
    expect.arrayContaining([
      expect.objectContaining({
        store: expect.objectContaining({ theme: 'dark' }),
      }),
    ]),
  );
});

it('composes arbitrary providers in registration order without remounting consumers', () => {
  const OrderContext = createContext('root');
  function NestedProvider({ children }: { children: ReactNode }) {
    const parent = useContext(OrderContext);
    return (
      <OrderContext.Provider value={`${parent}/inner`}>
        {children}
      </OrderContext.Provider>
    );
  }
  function Consumer() {
    const order = useContext(OrderContext);
    const [count, setCount] = useState(0);
    return (
      <button onClick={() => setCount(count + 1)}>
        {order}:{count}
      </button>
    );
  }
  const stores: GlobalStores = [
    {
      store: { dispose: jest.fn() },
      provide: (children) => (
        <OrderContext.Provider value="outer">{children}</OrderContext.Provider>
      ),
    },
    {
      store: { dispose: jest.fn() },
      provide: (children) => <NestedProvider>{children}</NestedProvider>,
    },
  ];
  const { rerender } = render(
    <RootStoreProvider globalStores={stores}>
      <Consumer />
    </RootStoreProvider>,
  );
  fireEvent.click(screen.getByRole('button'));
  rerender(
    <RootStoreProvider globalStores={stores}>
      <Consumer />
    </RootStoreProvider>,
  );
  expect(screen.getByRole('button').textContent).toBe('outer/inner:1');

  disposeGlobalStores(stores);
  for (const { store } of stores)
    expect(store.dispose).toHaveBeenCalledTimes(1);
});

it('renders children without registered stores', () => {
  render(<RootStoreProvider globalStores={[]}>No stores</RootStoreProvider>);
  expect(screen.queryByText('No stores')).not.toBeNull();
});

it('рендерит содержимое на сервере без запросов', () => {
  const html = renderToString(
    <StoreSetup>
      <span>Страница</span>
    </StoreSetup>,
  );
  expect(html).toContain('Страница');
  expect(loadPreferences).not.toHaveBeenCalled();
  expect(getUserProfileRequest).not.toHaveBeenCalled();
});

it('показывает страницу и профиль при зависших настройках', async () => {
  loadPreferences.mockReturnValue(new Promise(() => {}));
  const profile = {
    id: 4,
    name: 'Имя',
    email: 'user@example.com',
    roleName: { type: 'user' as const, title: 'Пользователь' },
  };
  jest.mocked(getUserProfileRequest).mockResolvedValue(profile);
  const { result } = renderHook(() => useUserProfileStore(), {
    wrapper: ({ children }) => (
      <StoreSetup>
        <span>Страница</span>
        {children}
      </StoreSetup>
    ),
  });
  expect(screen.getByText('Страница')).toBeTruthy();
  await act(async () => {});
  expect(result.current.profile).toEqual(profile);
});

it('применяет настройки при зависшем профиле', async () => {
  jest.mocked(getUserProfileRequest).mockReturnValue(new Promise(() => {}));
  loadPreferences.mockResolvedValue({ theme: 'light' });
  const { result } = renderHook(() => useUserPreferencesStore(), {
    wrapper: ({ children }) => <StoreSetup>{children}</StoreSetup>,
  });
  await act(async () => {});
  expect(result.current.theme).toBe('light');
});

it('сохраняет выбор темы, сделанный до завершения загрузки', async () => {
  let resolve!: (value: { theme: 'light' }) => void;
  loadPreferences.mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }),
  );
  const { result } = renderHook(() => useUserPreferencesStore(), {
    wrapper: ({ children }) => <StoreSetup>{children}</StoreSetup>,
  });
  act(() => result.current.setTheme('dark'));
  await act(async () => {
    jest.advanceTimersByTime(500);
  });
  expect(savePreferences).not.toHaveBeenCalled();
  await act(async () => {
    resolve({ theme: 'light' });
  });
  expect(result.current.theme).toBe('dark');
  await act(async () => {
    jest.advanceTimersByTime(500);
  });
  expect(savePreferences).toHaveBeenCalledWith({ theme: 'dark' });
});

it('создаёт работающие хранилища после повторного эффекта Strict Mode', async () => {
  loadPreferences.mockResolvedValue({ theme: 'light' });
  const { result } = renderHook(() => useUserPreferencesStore(), {
    wrapper: ({ children }) => (
      <StrictMode>
        <StoreSetup>{children}</StoreSetup>
      </StrictMode>
    ),
  });
  await act(async () => {});
  expect(result.current.theme).toBe('light');
  act(() => result.current.setTheme('dark'));
  await act(async () => {
    jest.advanceTimersByTime(500);
  });
  expect(savePreferences).toHaveBeenCalledWith({ theme: 'dark' });
});

it('гидратирует страницу при двух зависших запросах без расхождения темы', async () => {
  loadPreferences.mockReturnValue(new Promise(() => {}));
  jest.mocked(getUserProfileRequest).mockReturnValue(new Promise(() => {}));
  function ThemeValue() {
    return <span>{useTheme()}</span>;
  }
  const content = (
    <StoreSetup>
      <ThemeProvider>
        <ThemeValue />
      </ThemeProvider>
      <ProfileForm />
    </StoreSetup>
  );
  const container = document.createElement('div');
  container.innerHTML = renderToString(content);
  expect(container.textContent).toContain('light');
  document.body.appendChild(container);
  const onRecoverableError = jest.fn();
  let root!: ReturnType<typeof hydrateRoot>;
  try {
    await act(async () => {
      root = hydrateRoot(container, content, { onRecoverableError });
    });
    expect(container.textContent).toContain('dark');
    expect(container.textContent).toContain('Загрузка профиля…');
    expect(container.textContent).not.toContain('Профиль недоступен');
    expect(onRecoverableError).not.toHaveBeenCalled();
  } finally {
    act(() => root?.unmount());
    container.remove();
  }
});
