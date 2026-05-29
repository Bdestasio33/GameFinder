import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "./schema/index.js";

export type Database = PostgresJsDatabase<typeof schema>;

let client: postgres.Sql | null = null;
let database: Database | null = null;

export function createDb(connectionString: string): Database {
  if (database) {
    return database;
  }

  client = postgres(connectionString, { max: 1 });
  database = drizzle(client, { schema });
  return database;
}

export async function closeDb(): Promise<void> {
  if (client) {
    await client.end();
    client = null;
    database = null;
  }
}

export async function isDatabaseConnected(db: Database): Promise<boolean> {
  try {
    await db.execute(sql`select 1`);
    return true;
  } catch {
    return false;
  }
}

export { schema };
