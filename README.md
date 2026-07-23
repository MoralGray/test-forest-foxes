# Лисий диспетчер (Fox Dispatcher)

Интерактивное приложение для лесного смотрителя. Отслеживание наблюдений за лисами в волшебном лесу: карта 3x3, события в реальном времени, аналитика подозрительности.

## Стек

| Компонент | Технология |
|---|---|
| Frontend | React 19 + Vite 8 + Tailwind 4 + shadcn/ui |
| Backend | NestJS 11 + Prisma 7.8 |
| Database | SQLite (dev) / Postgres (prod) |
| Generator | fox-engine (standalone, HTTP POST) |

## Быстрый старт

```sh
# Установить зависимости
npm install

# Сгенерировать Prisma клиент
mise run all:db-generate

# Создать БД и применить схему
mise run all:db-push

# Запустить оба сервера
mise run all

# Frontend: http://localhost:3020
# Backend API: http://localhost:8020/api/health
```

## Seed данные

```sh
# Рабочий набор (30 наблюдений)
mise run all:seed-working

# Краш-тест (10,000 наблюдений)
mise run all:seed-crash

# Очистить БД
mise run all:seed-clean
```

## Fox Engine

Генератор случайных событий. Запускается автоматически через `mise run all`. Отправляет POST `/api/observations` каждые 30 секунд.

```sh
# Запустить отдельно
npx nx run fox-engine:dev
```

## Real-time

События появляются в реальном времени через SSE (`GET /api/observations/stream`) — левый сайдбар обновляется автоматически, ячейки карты анимируются.

## Импорт JSON

Нажмите кнопку **Import JSON** в левом сайдбаре и выберите файл. Пример файла: `assets/example-import.json`.

## Структура проекта

```
apps/
  forest-foxes-frontend/    # React приложение
  forest-foxes-backend/     # NestJS API
packages/
  forest-foxes-shared-prisma/  # Prisma schema + client
  mg-ui-shadcn-4/              # UI компоненты (shadcn/ui)
  mg-infinite-view-tanstack/   # Infinite scroll
  mg-table-tanstack/           # DataTable (TanStack Table)
services/
  fox-engine/                  # Генератор событий
```

## Команды

| Команда | Описание |
|---|---|
| `mise run all` | Запустить оба dev server + fox-engine |
| `npm run test:all` | Unit тесты всех проектов |
| `npm run typecheck:all` | Проверка типов всех проектов |
| `npm run lint` | Biome lint |
| `npm run check` | Biome + typecheck |

## API Endpoints

- `GET /api/observations` — список наблюдений (с пагинацией)
- `GET /api/observations/stream` — SSE stream (real-time)
- `POST /api/observations` — создать наблюдение
- `PATCH /api/observations/:id` — обновить
- `PATCH /api/observations/:id/process` — отметить обработанным
- `DELETE /api/observations/:id` — удалить
- `GET /api/observations/stats` — статистика
- `GET /api/observations/top-suspicious` — топ подозрительных
- `POST /api/observations/import` — массовый импорт JSON
- `POST /api/seeds/clean` — seed очистка
- `POST /api/seeds/working` — seed рабочий
- `POST /api/seeds/crash-test` — seed краш-тест
- `GET /api/health` — health check
