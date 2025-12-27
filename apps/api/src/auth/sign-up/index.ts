import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { SignUpReqSchema, SignUpResSchema } from "./postSchema";

const signUpApp = new OpenAPIHono();

const route = createRoute({
  path: "/",
  method: "post",
  request: {
    body: {
      content: {
        "application/json": {
          schema: SignUpReqSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: SignUpResSchema,
        },
      },
      description: "회원가입 성공",
    },
  },
});

signUpApp.openapi(route, async (c) => {
  const { username, email, password, passwordConfirm } = await c.req.json();
  return c.json({
    result: "Success",
  });
});

export default signUpApp;
