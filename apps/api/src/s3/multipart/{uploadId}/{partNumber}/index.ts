import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import Env from "../../../../../lib/env";
import { UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import getS3Client from "../../../../../lib/getS3Client";
import {
  ErrorSchema,
  SignPartParamSchema,
  SignPartQuerySchema,
  SignPartResSchema,
} from "@repo/validation";

const app = new OpenAPIHono<Env>();

// === Route 2: Sign Part (Presigned URL) ===
const signPartRoute = createRoute({
  method: "get",
  path: "/",
  request: {
    params: SignPartParamSchema,
    query: SignPartQuerySchema,
  },
  responses: {
    200: {
      content: { "application/json": { schema: SignPartResSchema } },
      description: "Presigned URL 발급 성공",
    },
    500: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "서버 에러",
    },
  },
});

app.openapi(signPartRoute, async (c) => {
  const { uploadId, partNumber } = c.req.valid("param");
  const { key } = c.req.valid("query");
  const s3 = getS3Client(c.env);
  const expiresIn = 900; // 15분

  try {
    const command = new UploadPartCommand({
      Bucket: c.env.R2_BUCKET,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
    });

    const url = await getSignedUrl(s3, command, { expiresIn });
    return c.json({ url, expires: expiresIn }, 200);
  } catch (err: any) {
    return c.json({ code: 500, message: err.message }, 500);
  }
});

export default app;
