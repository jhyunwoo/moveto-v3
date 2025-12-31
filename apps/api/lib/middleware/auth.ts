import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";

const authMiddleware = createMiddleware(async (c, next) => {
  const session = getCookie(c, "session");
  if (session) {
    const findSession = await c.env.session_kv.get(session);
    if (findSession) {
      c.set("session", JSON.parse(findSession));
    }
  }
  await next();
});

export default authMiddleware;
