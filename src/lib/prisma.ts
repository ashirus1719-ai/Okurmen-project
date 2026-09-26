import "server-only";

import { createPrismaClient } from "./db/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

// Lazy initialization allows pages that do not use the DB to build without secrets.
export function getPrisma() {
  return (globalForPrisma.prisma ??= createPrismaClient());
}
