import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../generated/prisma/client";

// Shared by the server-only entry point and the local connection check.
export function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString?.trim()) {
    throw new Error("Add DATABASE_URL from Neon to .env.local first.");
  }

  const adapter = new PrismaPg({
    connectionString,
    max: 5,
    connectionTimeoutMillis: 15_000,
    idleTimeoutMillis: 30_000,
  });

  return new PrismaClient({ adapter });
}
