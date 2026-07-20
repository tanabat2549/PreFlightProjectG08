import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";
import { connectionString } from "./utils.js";

export const dbConn = postgres(connectionString);
export const dbClient = drizzle(dbConn, { schema, logger: true });