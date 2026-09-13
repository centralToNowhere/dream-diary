/** @jest-environment node */

import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { createApiClient } from '@/lib/shared/http/apiClient';

function respond(
  config: InternalAxiosRequestConfig,
  status = 200,
  data: unknown = { success: true },
) {
  const response = {
    config,
    status,
    data,
    statusText: String(status),
    headers: {},
  };
  if (status >= 400)
    throw new AxiosError(
      'Request failed',
      'ERR_BAD_RESPONSE',
      config,
      undefined,
      response,
    );
  return response;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

it('refreshes once for concurrent 401s and retries the original body and method', async () => {
  const expired = jest.fn();
  const client = createApiClient(expired);
  const refreshStarted = deferred<void>();
  const refreshDone = deferred<void>();
  const attempts = new Map<string, number>();
  const requests: { url: string; method?: string; data: unknown }[] = [];
  client.defaults.adapter = async (config) => {
    const url = config.url!;
    requests.push({ url, method: config.method, data: config.data });
    if (url === '/auth/refresh') {
      refreshStarted.resolve();
      await refreshDone.promise;
      return respond(config);
    }
    const count = (attempts.get(url) ?? 0) + 1;
    attempts.set(url, count);
    return respond(config, count === 1 ? 401 : 200);
  };
  const body = { name: 'New name', email: 'new@example.com' };
  const profile = client.patch('/users/profile', body);
  const preferences = client.get('/users/preferences');
  await refreshStarted.promise;
  refreshDone.resolve();
  await Promise.all([profile, preferences]);
  expect(requests.filter(({ url }) => url === '/auth/refresh')).toHaveLength(1);
  expect(requests.filter(({ url }) => url === '/users/profile')).toEqual([
    { url: '/users/profile', method: 'patch', data: JSON.stringify(body) },
    { url: '/users/profile', method: 'patch', data: JSON.stringify(body) },
  ]);
  expect(attempts.get('/users/preferences')).toBe(2);
  expect(expired).not.toHaveBeenCalled();
});

it('reuses a completed refresh for a delayed 401 from the previous token', async () => {
  const client = createApiClient(jest.fn());
  const releaseSlow = deferred<void>();
  const counts: Record<string, number> = {};
  client.defaults.adapter = async (config) => {
    const url = config.url!;
    counts[url] = (counts[url] ?? 0) + 1;
    if (url === '/auth/refresh') return respond(config);
    if (url === '/slow' && counts[url] === 1) await releaseSlow.promise;
    return respond(config, counts[url] === 1 ? 401 : 200);
  };
  const slow = client.get('/slow');
  await client.get('/fast');
  releaseSlow.resolve();
  await slow;
  expect(counts['/auth/refresh']).toBe(1);
});

it('stops after one retry if the new token is also rejected', async () => {
  const expired = jest.fn();
  const client = createApiClient(expired);
  const requests: string[] = [];
  client.defaults.adapter = async (config) => {
    requests.push(config.url!);
    return respond(config, config.url === '/auth/refresh' ? 200 : 401);
  };
  await expect(client.get('/users/profile')).rejects.toMatchObject({
    response: { status: 401 },
  });
  expect(requests).toEqual([
    '/users/profile',
    '/auth/refresh',
    '/users/profile',
  ]);
  expect(expired).toHaveBeenCalledTimes(1);
});

it('redirects only once when a shared refresh fails with 401', async () => {
  const expired = jest.fn();
  const client = createApiClient(expired);
  const requests: string[] = [];
  client.defaults.adapter = async (config) => {
    requests.push(config.url!);
    return respond(config, 401);
  };
  const results = await Promise.allSettled([
    client.get('/one'),
    client.get('/two'),
  ]);
  expect(results.every(({ status }) => status === 'rejected')).toBe(true);
  expect(requests.filter((url) => url === '/auth/refresh')).toHaveLength(1);
  expect(expired).toHaveBeenCalledTimes(1);
});

it.each(['/auth/login', '/auth/logout', '/auth/refresh'])(
  'never refreshes a 401 from %s',
  async (url) => {
    const expired = jest.fn();
    const client = createApiClient(expired);
    const adapter = jest.fn(async (config: InternalAxiosRequestConfig) =>
      respond(config, 401),
    );
    client.defaults.adapter = adapter;
    await expect(client.post(url)).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(adapter).toHaveBeenCalledTimes(1);
    expect(expired).not.toHaveBeenCalled();
  },
);

it.each([500, undefined])(
  'does not log out on a temporary refresh failure: %s',
  async (status) => {
    const expired = jest.fn();
    const client = createApiClient(expired);
    client.defaults.adapter = async (config) => {
      if (config.url !== '/auth/refresh') return respond(config, 401);
      if (status) return respond(config, status);
      throw new AxiosError('Network error', 'ERR_NETWORK', config);
    };
    await expect(client.get('/users/profile')).rejects.toBeInstanceOf(
      AxiosError,
    );
    expect(expired).not.toHaveBeenCalled();
  },
);

it("does not replay an aborted request or cancel another request's shared refresh", async () => {
  const client = createApiClient(jest.fn());
  const controller = new AbortController();
  const refreshStarted = deferred<void>();
  const refreshDone = deferred<void>();
  const counts: Record<string, number> = {};
  client.defaults.adapter = async (config) => {
    const url = config.url!;
    counts[url] = (counts[url] ?? 0) + 1;
    if (url === '/auth/refresh') {
      expect(config.signal).toBeUndefined();
      refreshStarted.resolve();
      await refreshDone.promise;
      return respond(config);
    }
    return respond(config, counts[url] === 1 ? 401 : 200);
  };
  const cancelled = client
    .get('/cancelled', { signal: controller.signal })
    .catch((error) => error);
  const kept = client.get('/kept');
  await refreshStarted.promise;
  controller.abort();
  refreshDone.resolve();
  expect(axios.isCancel(await cancelled)).toBe(true);
  await kept;
  expect(counts).toEqual({ '/cancelled': 1, '/kept': 2, '/auth/refresh': 1 });
});
