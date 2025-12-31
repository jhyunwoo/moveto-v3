import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import Env from "../../../lib/env";
import { ErrorSchema, MeResSchema } from "@repo/validation";
import { SessionManager } from "../../../lib/auth/session";
import { getCookie } from "hono/cookie";

const signInApp = new OpenAPIHono<Env>();

const route = createRoute({
  path: "/",
  method: "get",
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: MeResSchema,
        },
      },
      description: "현재 로그인 된 사용자 정보",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "사용자 토큰이 잘못된 경우",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "로그인이 만료된 경우",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "기술적 이유로 오류가 난 경우",
    },
  },
});

const app = signInApp.openapi(
  route,
  async (c) => {
    const sessionId = getCookie(c, "session");

    if (!sessionId) {
      return c.json({ code: 400, message: "No Cookie" }, 400);
    }
    const session = new SessionManager(c.env.session_kv);

    const sessionData = await session.get(sessionId);
    if (!sessionData) {
      return c.json({ code: 401, message: "Unauthorized" }, 401);
    }

    return c.json(
      {
        id: sessionData.userId,
        username: sessionData.username,
        email: sessionData.email,
        plan: sessionData.plan,
      },
      200,
    );
  },
  (result, c) => {
    if (!result.success) {
      const errorMessage = JSON.parse(result.error.message)[0].message;
      return c.json(
        {
          code: 400,
          message: errorMessage ? errorMessage : "Validation Error",
        },
        400,
      );
    }
  },
);

export default app;
