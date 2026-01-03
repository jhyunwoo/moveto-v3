import { SessionPayload } from "./auth/session";

type Env = {
  Bindings: Bindings;
  Variables: Variables;
};

interface Variables {
  session: SessionPayload | undefined;
}

interface Bindings {
  db: D1Database;
  hash: Fetcher;
  session_kv: KVNamespace;
  r2: R2Bucket;
}

export default Env;
