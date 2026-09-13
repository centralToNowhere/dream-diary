import { makeAutoObservable, runInAction } from 'mobx';
import {
  updateUserProfileSchema,
  type UpdateUserProfileInput,
  type UserProfile,
} from '../types';

export default class UserProfileStore {
  profile: UserProfile | null;
  name: string;
  email: string;
  error: string | null;
  saved = false;
  isSaving = false;
  isLoading = false;
  private disposed = false;
  private controller: AbortController | null = null;

  constructor(
    profile: UserProfile | null,
    private readonly saveProfile: (
      input: UpdateUserProfileInput,
      signal: AbortSignal,
    ) => Promise<UserProfile>,
    private readonly loadProfile: (
      signal: AbortSignal,
    ) => Promise<UserProfile | null>,
    loadError: string | null = null,
  ) {
    this.profile = profile;
    this.name = profile?.name ?? '';
    this.email = profile?.email ?? '';
    this.error = loadError;
    makeAutoObservable<
      this,
      'saveProfile' | 'loadProfile' | 'controller' | 'disposed'
    >(this, {
      saveProfile: false,
      loadProfile: false,
      controller: false,
      disposed: false,
    });
  }

  get isDirty() {
    return (
      this.profile !== null &&
      (this.name.trim() !== this.profile.name ||
        this.email.trim() !== this.profile.email)
    );
  }

  setName = (value: string) => {
    if (this.disposed || this.isSaving) return;
    this.name = value;
    this.error = null;
    this.saved = false;
  };

  setEmail = (value: string) => {
    if (this.disposed || this.isSaving) return;
    this.email = value;
    this.error = null;
    this.saved = false;
  };

  resetDraft = () => {
    if (this.disposed || this.isSaving) return;
    this.name = this.profile?.name ?? '';
    this.email = this.profile?.email ?? '';
    this.error = null;
    this.saved = false;
  };

  save = async () => {
    if (
      this.disposed ||
      this.isSaving ||
      this.isLoading ||
      !this.profile ||
      !this.isDirty
    )
      return;
    const input = updateUserProfileSchema.safeParse({
      name: this.name,
      email: this.email,
    });
    this.saved = false;
    if (!input.success) {
      this.error = input.error.issues[0].message;
      return;
    }

    this.isSaving = true;
    this.error = null;
    this.controller = new AbortController();
    try {
      const profile = await this.saveProfile(
        input.data,
        this.controller.signal,
      );
      if (this.disposed) return;
      runInAction(() => {
        this.profile = profile;
        this.name = profile.name;
        this.email = profile.email;
        this.saved = true;
      });
    } catch (error: unknown) {
      if (!this.disposed)
        runInAction(() => {
          this.error =
            error instanceof Error
              ? error.message
              : 'Не удалось сохранить профиль';
        });
    } finally {
      if (!this.disposed)
        runInAction(() => {
          this.isSaving = false;
        });
      this.controller = null;
    }
  };

  reload = async () => {
    if (this.disposed || this.isLoading || this.isSaving) return;
    this.isLoading = true;
    this.error = null;
    this.controller = new AbortController();
    try {
      const profile = await this.loadProfile(this.controller.signal);
      if (this.disposed) return;
      runInAction(() => {
        this.profile = profile;
        this.resetDraft();
      });
    } catch {
      if (!this.disposed)
        runInAction(() => {
          this.error = 'Не удалось загрузить профиль. Попробуйте ещё раз.';
        });
    } finally {
      if (!this.disposed)
        runInAction(() => {
          this.isLoading = false;
        });
      this.controller = null;
    }
  };

  dispose = () => {
    this.disposed = true;
    this.controller?.abort();
    this.controller = null;
    this.profile = null;
    this.name = '';
    this.email = '';
    this.error = null;
    this.saved = false;
    this.isSaving = false;
    this.isLoading = false;
  };
}
