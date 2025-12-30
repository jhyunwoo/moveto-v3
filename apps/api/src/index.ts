import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { BaseResSchema } from "./getSchema";
import healthApp from "./health";
import authApp from "./auth";
import { cors } from "hono/cors";
import authMiddleware from "../lib/middleware/auth";
import Env from "../lib/env";

// Open API 기능이 포함된 app 생성
const app = new OpenAPIHono<Env>();

app.use(
  "/*",
  cors({
    // origin을 함수로 작성하여 여러 도메인을 동적으로 허용
    origin: (origin) => {
      const allowedOrigins = [
        "http://localhost:3000", // 실제 프론트엔드
        "http://localhost:8787", // Scalar 및 로컬 테스트
      ];

      // 요청한 origin이 허용 목록에 있으면 그대로 반환
      if (origin && allowedOrigins.includes(origin)) {
        return origin;
      }

      // (선택) 목록에 없으면 첫 번째 주소 반환 또는 null
      return allowedOrigins[0];
    },
    credentials: true, // 쿠키 허용
  }),
);

app.use(authMiddleware);

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
export type AppType = typeof app;
