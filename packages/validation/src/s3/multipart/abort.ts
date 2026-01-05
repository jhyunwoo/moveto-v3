import { z } from "@hono/zod-openapi";

const AbortMultipartUploadParamsSchema = z.object({ uploadId: z.string() });

const AbortMultipartUploadQuerySchema = z.object({ key: z.string() });

export { AbortMultipartUploadParamsSchema, AbortMultipartUploadQuerySchema };
