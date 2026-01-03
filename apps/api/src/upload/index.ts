import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import Env from "../../lib/env";

// --------------------------------------------------------------------------
// 1. 타입 및 인터페이스 정의
// --------------------------------------------------------------------------

// R2UploadedPart에 대응하는 Zod 스키마
const UploadedPartSchema = z.object({
  etag: z.string().openapi({ example: '"etag-string"' }),
  partNumber: z.number().openapi({ example: 1 }),
});

// 공통 에러 응답 스키마
const ErrorSchema = z.object({
  message: z.string(),
});

// 공통 경로 파라미터 (Key)
const KeyParamsSchema = z.object({
  key: z.string().openapi({
    param: {
      name: "key",
      in: "path",
    },
    example: "folder/image.png",
    description: "업로드할 파일의 경로 (파일명 포함)",
  }),
});

const app = new OpenAPIHono<Env>();

// --------------------------------------------------------------------------
// 2. Route 정의 (POST - 생성 및 완료)
// --------------------------------------------------------------------------

// POST 요청은 '생성(create)'과 '완료(complete)' 두 가지 역할을 수행합니다.
const postMultipartRoute = createRoute({
  method: "post",
  path: "/{key}",
  summary: "멀티파트 업로드 생성 또는 완료",
  description:
    "action 파라미터에 따라 업로드를 시작(mpu-create)하거나 완료(mpu-complete)합니다.",
  request: {
    params: KeyParamsSchema,
    query: z.object({
      action: z
        .enum(["mpu-create", "mpu-complete"])
        .openapi({ description: "수행할 작업 종류" }),
      uploadId: z
        .string()
        .optional()
        .openapi({ description: "완료 요청 시 필수" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            parts: z.array(UploadedPartSchema).optional(),
          }),
        },
      },
      description: "mpu-complete 작업 시 업로드된 파트 정보 필요",
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            key: z.string().optional(),
            uploadId: z.string().optional(),
          }),
        },
      },
      description: "성공 (생성 시 ID 반환, 완료 시 빈 바디)",
      headers: z.object({
        etag: z
          .string()
          .optional()
          .openapi({ description: "완료 시 파일 ETag" }),
      }),
    },
    400: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "잘못된 요청",
    },
  },
});

// --------------------------------------------------------------------------
// 3. Route 정의 (PUT - 파트 업로드)
// --------------------------------------------------------------------------

const putMultipartRoute = createRoute({
  method: "put",
  path: "/{key}",
  summary: "멀티파트 조각(Part) 업로드",
  description: "파일의 특정 조각을 업로드합니다. Binary Body를 사용합니다.",
  request: {
    params: KeyParamsSchema,
    query: z.object({
      action: z.literal("mpu-uploadpart"),
      uploadId: z.string(),
      partNumber: z.string().transform((v) => parseInt(v, 10)),
    }),
    body: {
      content: {
        "application/octet-stream": {
          schema: z.string().openapi({ format: "binary" }),
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: UploadedPartSchema,
        },
      },
      description: "업로드된 파트 정보(ETag) 반환",
    },
    400: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "잘못된 요청",
    },
  },
});

// --------------------------------------------------------------------------
// 4. Route 정의 (GET - 파일 조회)
// --------------------------------------------------------------------------

const getMultipartRoute = createRoute({
  method: "get",
  path: "/{key}",
  summary: "파일 다운로드",
  request: {
    params: KeyParamsSchema,
    query: z.object({
      action: z.literal("get"),
    }),
  },
  responses: {
    200: {
      description: "파일 스트림 반환",
      content: {
        "application/octet-stream": {
          schema: z.string().openapi({ format: "binary" }),
        },
      },
      headers: z.object({
        etag: z.string(),
      }),
    },
    404: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "파일을 찾을 수 없음",
    },
    400: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "잘못된 요청",
    },
  },
});

// --------------------------------------------------------------------------
// 5. Route 정의 (DELETE - 취소 및 삭제)
// --------------------------------------------------------------------------

const deleteMultipartRoute = createRoute({
  method: "delete",
  path: "/{key}",
  summary: "업로드 취소 또는 파일 삭제",
  request: {
    params: KeyParamsSchema,
    query: z.object({
      action: z.enum(["mpu-abort", "delete"]),
      uploadId: z.string().optional(),
    }),
  },
  responses: {
    204: {
      description: "성공적으로 처리됨 (No Content)",
    },
    400: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "잘못된 요청",
    },
  },
});

// --------------------------------------------------------------------------
// 6. Implementation (핸들러 구현)
// --------------------------------------------------------------------------

// 6-1. POST 핸들러
app.openapi(postMultipartRoute, async (c) => {
  const { key } = c.req.valid("param");
  const { action, uploadId } = c.req.valid("query");
  const bucket = c.env.r2;

  // Case 1: 멀티파트 생성 (mpu-create)
  if (action === "mpu-create") {
    const multipartUpload = await bucket.createMultipartUpload(key);
    return c.json(
      {
        key: multipartUpload.key,
        uploadId: multipartUpload.uploadId,
      },
      200,
    );
  }

  // Case 2: 멀티파트 완료 (mpu-complete)
  if (action === "mpu-complete") {
    if (!uploadId) {
      return c.json({ message: "Missing uploadId" }, 400);
    }

    const body = await c.req.json();
    if (!body || !body.parts) {
      return c.json({ message: "Missing parts in body" }, 400);
    }

    try {
      const multipartUpload = bucket.resumeMultipartUpload(key, uploadId);
      const object = await multipartUpload.complete(body.parts);

      // ETag 헤더 설정 및 응답
      c.header("etag", object.httpEtag);
      return c.json({}, 200);
    } catch (error: any) {
      return c.json({ message: error.message }, 400);
    }
  }

  return c.json({ message: "Invalid action" }, 400);
});

// 6-2. PUT 핸들러
app.openapi(putMultipartRoute, async (c) => {
  const { key } = c.req.valid("param");
  const { uploadId, partNumber } = c.req.valid("query");
  const bucket = c.env.r2;

  // Hono의 raw body(스트림) 가져오기
  const body = c.req.raw.body;
  if (!body) {
    return c.json({ message: "Missing request body" }, 400);
  }

  try {
    const multipartUpload = bucket.resumeMultipartUpload(key, uploadId);
    const uploadedPart = await multipartUpload.uploadPart(partNumber, body);
    return c.json(uploadedPart, 200);
  } catch (error: any) {
    return c.json({ message: error.message }, 400);
  }
});

// 6-3. GET 핸들러
app.openapi(getMultipartRoute, async (c) => {
  const { key } = c.req.valid("param");
  const bucket = c.env.r2;

  const object = await bucket.get(key);
  if (!object) {
    return c.json({ message: "Object Not Found" }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);

  // 바이너리 스트림 반환
  return new Response(object.body, { headers });
});

// 6-4. DELETE 핸들러
app.openapi(deleteMultipartRoute, async (c) => {
  const { key } = c.req.valid("param");
  const { action, uploadId } = c.req.valid("query");
  const bucket = c.env.r2;

  if (action === "mpu-abort") {
    if (!uploadId) {
      return c.json({ message: "Missing uploadId" }, 400);
    }
    try {
      const multipartUpload = bucket.resumeMultipartUpload(key, uploadId);
      await multipartUpload.abort();
      return c.body(null, 204);
    } catch (error: any) {
      return c.json({ message: error.message }, 400);
    }
  }

  if (action === "delete") {
    await bucket.delete(key);
    return c.body(null, 204);
  }

  return c.json({ message: "Invalid action" }, 400);
});

export default app;
