import { SessionPayload } from "./auth/session";

type Env = {
  Bindings: Bindings;
  Variables: Variables;
};

export interface Variables {
  session: SessionPayload | undefined;
}

export interface Bindings {
  db: D1Database;
  hash: Fetcher;
  session_kv: KVNamespace;
  r2: R2Bucket;
  R2_KEY: string;
  R2_SECRET: string;
  R2_BUCKET: string;
  R2_ENDPOINT: string; // R2 사용 시 필수 (예: https://<accountid>.r2.cloudflarestorage.com)
}

export default Env;
