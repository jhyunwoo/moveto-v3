import type { AppType } from "api";
import { hc } from "hono/client";

const clientApi = hc<AppType>(
  process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : "http://localhost:8787",
);

export default clientApi;
