import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";
import { config } from "../shared/config/config";

const pool = new Pool({ connectionString: config.databaseUrl });
export const db = drizzle(pool, { schema });
