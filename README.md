# Dream Diary

## Локальный запуск в Docker

Для запуска нужны Docker с Compose и свободные порты `3000`, `5431`, `9000` и
`9001`.

1. Создайте локальный файл окружения и при необходимости замените пароли и
   `JWT_SECRET`:

   ```bash
   cp .env.example .env
   ```

2. Соберите и запустите приложение вместе с PostgreSQL и MinIO:

   ```bash
   docker compose up --build -d
   ```

   Compose дождётся готовности PostgreSQL, применит миграции, создаст bucket в
   MinIO и затем запустит Next.js.

3. Откройте приложение: [http://localhost:3000](http://localhost:3000).

Полезные команды:

```bash
docker compose ps           # состояние контейнеров
docker compose logs -f next # логи приложения
docker compose down         # остановить контейнеры
```

Данные PostgreSQL и MinIO сохраняются в Docker volumes после остановки
контейнеров. Команда `docker compose down -v` также удалит эти данные.

## Разработка

Установите зависимости и запустите инфраструктуру из development-конфига:

```bash
yarn install
docker compose -f docker-compose.dev.yaml up -d
yarn dev
```

Next.js запускается на хосте с hot reload. PostgreSQL доступен через порт из
`POSTGRES_HOST_PORT`, а MinIO — через порты `MINIO_API_HOST_PORT` и
`MINIO_CONSOLE_HOST_PORT`.

### Авторизация

Приложение использует подписанный JWT в HttpOnly-cookie `jwt` и отдельный
refresh token в HttpOnly-cookie `refreshToken`. JWT содержит данные пользователя
и проверяется без запроса сессии к базе. Refresh token хранится в базе в виде
SHA-256-хеша и используется для выпуска нового JWT.

Краткая памятка по выбору проверки:

| Контекст                                                             | Guard                | Поведение при невалидной сессии                                          |
| -------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------ |
| Server Component, Server Action или вызываемая ими серверная функция | `loginRequired()`    | Не обновляет JWT и не изменяет cookies; перенаправляет на страницу входа |
| Route Handler (`app/api/**`)                                         | `loginRequiredApi()` | Не обновляет JWT; удаляет невалидный JWT и возвращает `401` без redirect |

Оба guard находятся в `features/auth/loginRequired.ts` и возвращают
`UserProfile` при успешной проверке.

GET/HEAD-запросы страниц и POST-запросы Server Actions до выполнения проверяет
`proxy.ts`. Список публичных маршрутов находится в `app/routes.ts`:

```ts
export const PUBLIC_ROUTES = ['/', '/login', '/register'];
```

Все остальные маршруты приватны по умолчанию. Публичный маршрут нужно явно
добавить в `PUBLIC_ROUTES`; Route Group `(public)` сам по себе на URL и Proxy не
влияет.

- Для приватного маршрута Proxy проверяет JWT, при необходимости использует
  refresh token, обновляет cookies или перенаправляет на `/login`.
- Server Action определяется по заголовку `next-action`. После успешного refresh
  исходный POST и его `FormData` продолжают выполняться.
- На публичном маршруте проверка опциональна: при ошибке страница продолжает
  рендериться для гостя.
- Проверенный профиль передаётся внутрь server request через `x-user-data`,
  поэтому `loginRequired()` не выполняет повторную проверку JWT.
- API-запросы Proxy не проверяет. После `401` клиент вызывает
  `/api/auth/refresh` и повторяет исходный запрос; параллельные запросы должны
  использовать один общий refresh promise/mutex.
- Guard-функции не запускают refresh. Его выполняют Proxy либо явный запрос к
  `/api/auth/refresh`.
- Auth Route Handlers (`login`, `refresh`, `logout`) guard не вызывают: они сами
  реализуют auth flow.

Срок действия JWT задаётся через `ACCESS_TOKEN_EXPIRES_MINUTES`, срок действия
refresh token — через `REFRESH_TOKEN_EXPIRES_DAYS`, ключ подписи — через
`JWT_SECRET`.

### Миграции базы данных

SQL-миграции находятся в `infrastructure/db/migrations` и выполняются через
dbmate в Compose-контейнере.

```bash
yarn db:status                 # показать применённые и ожидающие миграции
yarn db:new <migration-name>   # создать новый файл миграции
yarn db:migrate                # применить ожидающие миграции
yarn db:rollback               # откатить последнюю миграцию
```

Новая миграция должна содержать секции `-- migrate:up` и `-- migrate:down`.
Перед коммитом проверьте применение и откат миграции на локальной базе.

### S3 и MinIO

Локальным S3-совместимым хранилищем служит MinIO:

- API: [http://localhost:9000](http://localhost:9000);
- консоль: [http://localhost:9001](http://localhost:9001);
- bucket создаётся сервисом `minio-init` из значения `S3_BUCKET`;
- данные хранятся в volume из `MINIO_VOLUME_NAME`.

Приложение обращается к MinIO по настройкам `S3_ENDPOINT`, `S3_REGION`,
`S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` и `S3_FORCE_PATH_STYLE`.

Для резервной копии сначала остановите MinIO, чтобы данные не изменялись во
время копирования:

```bash
docker compose stop minio
docker run --rm \
  -v dream_diary_minio_data:/data:ro \
  -v "$PWD":/backup \
  alpine tar czf /backup/minio-data.tar.gz -C /data .
```

Восстановление на другом хосте:

```bash
docker volume create dream_diary_minio_data
docker run --rm \
  -v dream_diary_minio_data:/data \
  -v "$PWD":/backup:ro \
  alpine tar xzf /backup/minio-data.tar.gz -C /data
```

Если `MINIO_VOLUME_NAME` изменён, используйте его значение вместо
`dream_diary_minio_data`.
