import { readFile } from "node:fs/promises";
import { loadEnvConfig } from "@next/env";
import { Client } from "pg";

loadEnvConfig(process.cwd(), true);

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error("Pass a migration file path");

  const sql = await readFile(file, "utf8");
  const statements = sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter((statement) => statement && statement !== "BEGIN" && statement !== "COMMIT");

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query("BEGIN");
  try {
    for (const [index, statement] of statements.entries()) {
      try {
        await client.query(statement);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown SQL error";
        console.error(`Statement ${index + 1}: ${statement.slice(0, 240)}\n${message}`);
        process.exitCode = 1;
        return;
      }
    }
    console.log(`Validated ${statements.length} statements from ${file}`);
  } finally {
    await client.query("ROLLBACK");
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Migration validation failed");
  process.exitCode = 1;
});
