# Окурмэн айти

Next.js 16 + Prisma ORM 7 + Neon PostgreSQL. Для разработки используйте Node.js 24.

## Подключение базы

1. Выполните `npm ci`.
2. Создайте `.env.local` по образцу `.env.example`, если файла ещё нет.
3. В Neon откройте **Connect**, выберите нужную ветку и базу, скопируйте pooled connection string в `DATABASE_URL`. Сохраните SSL-параметры Neon. Для разработки используйте отдельную ветку Neon.
4. Выполните `npm run db:check`: команда делает только `SELECT 1` через Prisma.
5. Для новой пустой базы выполните `npm run db:deploy`, чтобы применить сохранённые миграции.

Если база уже содержит таблицы, сначала согласуйте её схему с миграциями (introspection/baseline); не применяйте начальную миграцию вслепую.

`DIRECT_URL` необязателен: это прямое соединение для Prisma CLI с той же базой/веткой. Если он не указан, CLI использует `DATABASE_URL`. Next.js, Prisma CLI и проверка соединения загружают `.env.local` через правила Next.js. Секреты не коммитятся и не должны иметь префикс `NEXT_PUBLIC_`.

## Авторизация

Better Auth обслуживает регистрацию и вход по email/паролю, подтверждение email шестизначным кодом, повторную отправку кода, сброс пароля по коду, Google OAuth и 30-дневные сессии. Коды действуют 5 минут, хранятся в БД в хешированном виде и имеют ограничение числа попыток. Письма отправляются через Resend.

Заполните auth-переменные из `.env.example` в `.env.local`. `BETTER_AUTH_SECRET` должен быть случайным значением длиной не менее 32 символов; задайте `BETTER_AUTH_URL` как канонический origin сайта. Для Google OAuth добавьте redirect URI `https://<ваш-домен>/api/auth/callback/google` в настройках OAuth client. Для Resend подтвердите домен отправителя и укажите его в `AUTH_EMAIL_FROM`. Без OAuth-ключей Google-кнопка будет неактивна, без настроек Resend отправка кодов завершится ошибкой.

Перед запуском авторизации примените миграции командой `npm run db:deploy`. Миграция сохраняет старые UUID-аккаунты и допускает `NULL` email только для существующих записей без email; новые регистрации Better Auth создаёт с обязательным адресом и не открывает сессию до его подтверждения.

## Команды Prisma

- `npm run db:generate` — сгенерировать клиент без подключения к базе.
- `npm run db:validate` — проверить схему.
- `npm run db:check` — проверить соединение без изменения данных.
- `npm run db:migrate -- --name change_name` — создать и применить миграцию в базе разработки.
- `npm run db:deploy` — применить существующие миграции (в том числе при развёртывании).
- `npm run db:studio` — открыть редактор данных Prisma Studio.

Модель `users` связана с `user_roles`, `sessions` и `accounts`; существующие роли остаются отдельными и не назначаются автоматически при регистрации.

В Server Components, Server Actions и Route Handlers с Node.js runtime:

```ts
import { getPrisma } from "@/lib/prisma";

const prisma = getPrisma();
// Проверяйте авторизацию и права до чтения пользовательских данных.
```

Клиент создаётся при первом обращении и переиспользуется, включая hot reload. `lib/prisma.ts` защищён импортом `server-only`. Не импортируйте `lib/db/client.ts` в клиентские компоненты: это общий конструктор для серверного модуля и CLI-проверки.

При деплое задайте `DATABASE_URL` в секретах хостинга, выполните миграции отдельным шагом `npm run db:deploy` и затем сборку. `npm run build` генерирует клиент, но не применяет миграции. Сборка текущего статического сайта возможна без доступа к базе.

На момент настройки `npm audit` сообщает о 4 high-записях в цепочке зависимостей Prisma CLI 7.10.0 (`deepmerge-ts`, `mysql2` и зависящие пакеты). Автоматическое исправление предлагает переход на Prisma 6; оно не применено. Перед продакшеном повторите аудит и проверьте исправления upstream. Эти предупреждения сохраняются и при `--omit=dev`, поскольку CLI также попадает в дерево peer-зависимостей клиента.

---

Проект создан с помощью [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
