import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { HealthResSchema } from "./getSchema";

const healthApp = new OpenAPIHono();

const route = createRoute({
  path: "/",
  method: "get",
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: HealthResSchema,
        },
      },
      description: "API에 정상적으로 접근이 가능한지 확인하는 기능",
    },
  },
});

healthApp.openapi(route, (c) => {
  return c.json(
    {
      status: "API is Healthy",
      timestamp: new Date().toISOString(),
    },
    200,
  );
});

export default healthApp;
