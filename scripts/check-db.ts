import { loadEnvConfig } from "@next/env";
import { createPrismaClient } from "../lib/db/client";

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("Добавьте DATABASE_URL из Neon в .env.local и повторите npm run db:check.");
    process.exitCode = 1;
    return;
  }

  const prisma = createPrismaClient();
  try {
    const result = await prisma.$queryRaw<{ ok: number }[]>`SELECT 1 AS ok`;
    if (result[0]?.ok !== 1) throw new Error("Unexpected database response");
    console.log("Соединение с PostgreSQL через Prisma успешно. Данные не изменены.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(() => {
  // Driver errors may include connection details; keep credentials out of logs.
  console.error("Не удалось подключиться. Проверьте DATABASE_URL, SSL-параметры и доступ к Neon.");
  process.exitCode = 1;
});
