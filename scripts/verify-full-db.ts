import { loadEnvConfig } from "@next/env";
import { Client } from "pg";

loadEnvConfig(process.cwd(), true);

const requiredTables = [
  "users", "roles", "permissions", "courses", "course_versions", "lessons", "groups",
  "enrollments", "assignments", "test_attempts", "projects", "certificates", "leads",
  "orders", "payment_attempts", "site_pages", "blog_posts", "events", "conversations",
  "notifications", "achievements", "games", "hackathons", "audit_logs", "outbox_events",
];

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const tables = await client.query<{ table_name: string }>("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name");
    const foreignKeys = await client.query<{ count: string }>("SELECT count(*) FROM pg_constraint c JOIN pg_namespace n ON n.oid=c.connamespace WHERE n.nspname='public' AND c.contype='f'");
    const indexes = await client.query<{ count: string }>("SELECT count(*) FROM pg_indexes WHERE schemaname='public'");
    const enums = await client.query<{ count: string }>("SELECT count(*) FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typtype='e'");
    const invalidConstraints = await client.query<{ count: string }>("SELECT count(*) FROM pg_constraint c JOIN pg_namespace n ON n.oid=c.connamespace WHERE n.nspname='public' AND NOT c.convalidated");
    const failedMigrations = await client.query<{ count: string }>("SELECT count(*) FROM _prisma_migrations WHERE finished_at IS NULL AND rolled_back_at IS NULL");
    const data = await client.query<{ users: string; leads: string }>("SELECT (SELECT count(*) FROM users) users, (SELECT count(*) FROM leads) leads");

    const names = new Set(tables.rows.map((row) => row.table_name));
    const missing = requiredTables.filter((table) => !names.has(table));
    const result = {
      tables: tables.rowCount,
      foreignKeys: Number(foreignKeys.rows[0].count),
      indexes: Number(indexes.rows[0].count),
      enums: Number(enums.rows[0].count),
      invalidConstraints: Number(invalidConstraints.rows[0].count),
      unfinishedMigrations: Number(failedMigrations.rows[0].count),
      missingRequiredTables: missing,
      preservedRows: { users: Number(data.rows[0].users), leads: Number(data.rows[0].leads) },
    };
    console.log(JSON.stringify(result, null, 2));
    if (missing.length || result.invalidConstraints || result.unfinishedMigrations) process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Database verification failed");
  process.exitCode = 1;
});
