This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Авторизация

Краткая памятка по выбору проверки:

| Контекст | Guard | Поведение при невалидной сессии |
| --- | --- | --- |
| Server Component, Server Action или вызываемая ими серверная функция | `loginRequired()` | Без refresh и изменения cookies; при ошибке выполняет redirect на login |
| Route Handler (`app/api/**`) | `loginRequiredApi()` | Без refresh; удаляет невалидный access и возвращает `401` без redirect |

Оба guard находятся в `features/auth/loginRequired.ts` и возвращают
`UserProfile` при успешной проверке.

GET/HEAD-запросы страниц и POST-запросы Server Actions до выполнения проверяет
`proxy.ts`. Список публичных маршрутов находится в `app/routes.ts`:

```ts
export const PUBLIC_ROUTES = ["/", "/login", "/register"];
```

Все остальные маршруты приватны по умолчанию. Публичный маршрут нужно явно
добавить в `PUBLIC_ROUTES`; Route Group `(public)` сам по себе на URL и Proxy не
влияет.

- Для приватного маршрута Proxy проверяет access, при необходимости делает
  refresh, обновляет cookies или отправляет на `/login`.
- Server Action определяется по заголовку `next-action`. При успешном refresh
  исходный POST и его `FormData` продолжают выполняться в том же запросе.
- Для публичного маршрута та же проверка выполняется опционально: при ошибке
  страница продолжает рендериться как гостевая.
- При успехе Proxy передаёт проверенный профиль внутрь server request через
  `x-user-data`, поэтому `loginRequired()` не повторяет запрос к БД.
- API-запросы Proxy не проверяет. После `401` клиент вызывает
  `/api/auth/refresh` и повторяет исходный запрос; параллельные запросы должны
  использовать один общий refresh promise/mutex.
- Автоматическую ротацию access-токена выполняет только Proxy. Guard-функции
  `loginRequired*` никогда не запускают refresh; `/api/auth/refresh` остаётся
  отдельной явной операцией клиента.
- Auth Route Handlers (`login`, `refresh`, `logout`) guard не вызывают: они сами
  реализуют auth flow.

## Database migrations

Create new migration file

```bash
yarn db:new <migration-name>
```

Apply migrations

```bash
yarn db:migrate
```

Rollback last migration
```bash
db:rollback
```

## Local S3 storage

The Compose configurations run MinIO with its S3 API on port `9000` and its
web console on port `9001`. The `minio-init` service creates the bucket from
`S3_BUCKET` automatically. Object data is stored in the named Docker volume
configured by `MINIO_VOLUME_NAME`.

Back up the volume to the current directory:

```bash
docker run --rm \
  -v dream_diary_minio_data:/data:ro \
  -v "$PWD":/backup \
  alpine tar czf /backup/minio-data.tar.gz -C /data .
```

Restore it on another host after creating the target volume:

```bash
docker volume create dream_diary_minio_data
docker run --rm \
  -v dream_diary_minio_data:/data \
  -v "$PWD":/backup:ro \
  alpine tar xzf /backup/minio-data.tar.gz -C /data
```

Stop MinIO before backup or restore so that the copied data is consistent.
