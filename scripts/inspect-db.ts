import { loadEnvConfig } from "@next/env";
import { Client } from "pg";

loadEnvConfig(process.cwd(), true);

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
  const tables = await client.query<{ tablename: string }>(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY 1",
  );
  const enums = await client.query<{ typname: string }>(
    "SELECT typname FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public' AND t.typtype = 'e' ORDER BY 1",
  );
  const migrations = await client.query<{ migration_name: string; applied: boolean; logs: string | null }>(
    "SELECT migration_name, finished_at IS NOT NULL AS applied, logs FROM _prisma_migrations ORDER BY started_at",
  );
  console.log(JSON.stringify({ tables: tables.rows.map(row => row.tablename), enums: enums.rows.map(row => row.typname), migrations: migrations.rows }, null, 2));
  } finally {
    await client.end();
  }
}

main().catch(error => {
  console.error(JSON.stringify({ code: error instanceof Error && "code" in error ? error.code : "UNKNOWN" }));
  process.exitCode = 1;
});
