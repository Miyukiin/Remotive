import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool as pgPool } from "pg";
import { Pool as neonPool} from '@neondatabase/serverless';
import * as schema from "./schema";
import * as relations from "./relations";

// Because we're using .env.local, we have to configure the path.
// Have to use dotenv to load the env vars before execution.
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const neonDatabaseURL = process.env.NEON_DATABASE_URL!;
const dockerPgDatabaseURL = process.env.DOCKERPG_DATABASE_URL!;

// Solves querying by relations issue. https://github.com/drizzle-team/drizzle-orm/discussions/2718
// Conditional database connection based on environment variable
export const db =
  process.env.IS_USING_NEON === "true"
    ? drizzleNeon(
        new neonPool({connectionString: neonDatabaseURL!}), 
        { schema: { ...schema, ...relations } },
      )
    : drizzlePg(new pgPool({ connectionString: dockerPgDatabaseURL! }), {
        schema: { ...schema, ...relations },
      });
