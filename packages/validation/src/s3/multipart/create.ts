import { z } from "@hono/zod-openapi";

const CreateMultipartReqSchema = z.object({
  filename: z.string(),
  type: z.string(),
  metadata: z
    .record(z.string(), z.string())
    .optional()
    .openapi({
      example: { "uploaded-by": "user123" },
      description: "S3 객체 메타데이터 (Key-Value 모두 문자열이어야 함)",
    }),
});

const CreateMultipartResSchema = z.object({
  key: z.string(),
  uploadId: z.string(),
});

export { CreateMultipartReqSchema, CreateMultipartResSchema };