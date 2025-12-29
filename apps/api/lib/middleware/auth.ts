import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";

const authMiddleware = createMiddleware(async (c, next) => {
  const session = getCookie(c, "session");
  console.log("session", session);
  if (session) {
    const findSession = await c.env.session_kv.get(`sess:${session}`);
    console.log(findSession);
    if (findSession) {
      c.set("session", JSON.parse(findSession));
    }
  }
  await next();
});

export default authMiddleware;
