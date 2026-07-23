# AI Worklog

## 1. Описание Raw
В самом начале. Будь то проект или задача, идет описание задачи/проекта.
На основе этого описания применяются скилы mg-docs, mg-todo, mg-roadmap, любые другие.
Обдумывание проекта. Фантазии, мысли, идеи.

## 2. Структура
Докидывание общих моментов по проекту.
Общие либы, структура.

## 3. Доработка RAW.md перед созданием документации
Беру RAW.md и общаюсь с моделькой. Уточняю все нюансы.
Как только представление будет полным — беру скилл mg-docs и генерирую документацию.

## 4. Доработка DOCS.md
Докидывание фич, сравнение ориг/сырого тз.
Доработка перед TODO.md и ROADMAP.md.

## 5. TODO.md
На основе документации генерируем скилом задачи в TODO.md.

## 6. ROADMAP.md
На основе DOCS.md и TODO.md строим roadmap с 6 фазами. Приоритизация: foundation → backend → frontend shell → core UI → analytics → auxiliary. Все фичи и эпики привязаны к фазам, orphan references отсутствуют.

## 7. Foundation Phase — реализация
Созданы директории frontend/backend/shared-prisma/fox-engine. Настроены Nx targets, tsconfig, vite.config, mise.toml ports и DB path. Написана Prisma-схема (Location, Fox, Observation), сгенерирован клиент, создана SQLite БД. NestJS-приложение с PrismaModule, ValidationPipe и health check. Всё проходит typecheck и lint.

## 8. AGENTS.md + graphify + Nx skills
Создан AGENTS.md с project-specific инструкциями: команды, таблица проектов/портов, ссылки на доки, notes по legacy и БД. Добавлен graphify-out/ в .gitignore. Nx-шаблон из AGENTS.md заменён на релевантное содержимое.

## 9. Backend Data Phase — CRUD + analytics + seeds
Реализован Observations модуль (CRUD, stats, top-suspicious, locations, import, seeds). Добавлены @Inject для совместимости DI с tsx/esbuild. Все endpoint'ы проверены: create/list/update/process/delete observations, stats, top-suspicious, locations, working seed (30 obs), crash-test seed (10,000 obs). SQLite БД пересоздана, typecheck и lint проходят.
Добавлены suspicion buckets (low/medium/high) в stats.

## 10. Frontend Shell Phase
Созданы Zustand stores (Observation, Filter, Tab, ViewMode). API слой на fetch. ThreeColumnLayout для верхней и нижней секций. HomePage с картой 3x3, сайдбарами событий, кнопкой Import JSON, таблицей и placeholder для графиков. WorklogPage с данными из HISTORY.md. Header с навигацией. Всё проходит typecheck.

## 11. Event Management Phase
Весь UI переведён на shadcn компоненты из @mg-nx-forge/mg-ui-shadcn-4. Созданы: ForestMap (3x3 grid с кликом-фильтром), EventInbox (сайдбар с Import JSON + toast), ProcessedEvents (отработанные), EventDetailModal (Dialog с редактированием полей, Mark as Processed, Save), EventsTable (сортировка по колонкам, tab-фильтрация). HomePage использует shadcn Tabs и CSS Grid. All shadcn, no raw HTML.

## 12. Analytics Dashboard Phase
Созданы: DonutChart (recharts + shadcn Chart, 4 доната: цвет, локация, has_prey, подозрительность), SummaryCard (уникальные лисы, avg suspicion, pending/processed), TopFiveTable (рейтинг с Badge #1), FactorImpactTable (визуальные бары влияния признаков). Все компоненты реактивны к TabStore. HomePage интегрирует аналитику в нижнюю секцию.

## 13. Auxiliary Services Phase
Fox-engine: добавлена retry-логика (3 попытки с задержкой 2s при недоступности backend). WorklogPage: весь контент переведён на shadcn Typography (H1, H2, P, Muted). Все 6 фаз roadmap завершены.

## 14. Testing and Fixes Phase
Добавлен epic-testing-fixes в TODO.md и фаза Testing and Fixes в ROADMAP.md. Проведено ручное тестирование. Исправлены баги: фильтрация таба "Самые подозрительные", 500 на PATCH processed, cell stats исключают processed, дедупликация цветов в аналитике.

## 15. Кратко по итогу
- Почти всё сгенерировано с OpenCode на DeepSeek v4 Flash.
- Модель выбрана потому что практически бесплатная. Ошибается чаще премиум-моделей, но для тестового задания — более чем достаточно.
- Кратко по процессу работы с AI:
  - Описал мысли и идеи в RAW.md.
  - Применил mg-docs для генерации документации на основе сырых заметок.
  - Применил mg-todo для раскладки по эпикам и задачам.
  - Применил mg-roadmap для построения фаз и приоритетов.
  - Работа шла по этапам — от фундамента к фичам.
  - Как только появлялся рабочий прототип — применял mg-make-tests, чтобы закрепить скелет тестами.
  - Затем багфиксы и улучшения по результатам ручного тестирования.
  - Полировка: документация, конфиги, проверки, тултипы, визуальные улучшения.
