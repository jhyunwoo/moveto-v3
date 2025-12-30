import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import Env from "../../../lib/env";
import AuthManager from "../../../lib/auth/auth";
import {
  ErrorSchema,
  SignInReqSchema,
  SignInResSchema,
} from "@repo/validation";

const signInApp = new OpenAPIHono<Env>();

const route = createRoute({
  path: "/",
  method: "post",
  request: {
    body: {
      content: {
        "application/json": {
          schema: SignInReqSchema,
        },
      },
      description: "로그인 정보",
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: SignInResSchema,
        },
      },
      description: "로그인 성공",
      headers: z.object({
        "Set-Cookie": z.string().openapi({
          description: "세션 쿠키 및 기타 쿠키",
          example: "session=uuid; Path=/; HttpOnly; Secure",
        }),
      }),
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "사용자 입력이 잘못되어 회원가입을 처리할 수 없는 경우",
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
    const { email, password } = await c.req.json();

    const auth = new AuthManager(c);
    const result = await auth.signIn(email, password);

    return c.json(result, 200);
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
