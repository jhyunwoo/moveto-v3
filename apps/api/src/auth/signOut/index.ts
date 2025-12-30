import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import Env from "../../../lib/env";
import AuthManager from "../../../lib/auth/auth";
import { ErrorSchema, SignOutResSchema } from "@repo/validation";

const signOutApp = new OpenAPIHono<Env>();

const putRoute = createRoute({
  path: "/",
  method: "put",
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: SignOutResSchema,
        },
      },
      description: "로그아웃 성공",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "사용자 입력 오류로 로그아웃을 처리할 수 없는 경우",
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

const app = signOutApp.openapi(putRoute, async (c) => {
  const auth = new AuthManager(c);
  const result = await auth.signOut();

  return c.json(result, 200);
});

export default app;
