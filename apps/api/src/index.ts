import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { BaseResSchema } from "./getSchema";
import healthApp from "./health";
import authApp from "./auth";
import Bindings from "../lib/cloudflare-bindings";

// Open API 기능이 포함된 app 생성
const app = new OpenAPIHono<{ Bindings: Bindings }>();

// Open API Route 설정
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Moveto V3 API",
  },
});

// Scalar를 사용하여 Open API Docs 제공
app.get("/scalar", Scalar({ url: "/doc" }));

// 기본 라우트 생성
const route = createRoute({
  method: "get",
  path: "/",
  request: {},
  responses: {
    200: {
      content: { "application/json": { schema: BaseResSchema } },
      description: "Base route",
    },
  },
});

// 기본 라우트 처리
app.openapi(route, (c) => {
  return c.json({ message: "Moveto V3 API" }, 200);
});

// Route Grouping
app.route("/health", healthApp);
app.route("/auth", authApp);

export default app;
