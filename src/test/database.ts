import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";

import * as schema from "@/db/schema";

export async function createTestDatabase() {
  const client = new PGlite();
  const directory = path.join(process.cwd(), "drizzle");
  for (const file of (await readdir(directory))
    .filter((name) => name.endsWith(".sql"))
    .sort()) {
    await client.exec(await readFile(path.join(directory, file), "utf8"));
  }
  return { client, db: drizzle(client, { schema }) };
}
