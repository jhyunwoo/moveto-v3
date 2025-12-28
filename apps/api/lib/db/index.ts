import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export default function createDB(db: D1Database) {
  return drizzle(db, { schema: schema });
}
