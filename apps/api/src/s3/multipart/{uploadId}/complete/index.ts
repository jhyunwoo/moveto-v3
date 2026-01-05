import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import Env from "../../../../../lib/env";
import {
  CompleteMultipartReqSchema,
  CompleteMultipartResSchema,
  ErrorSchema,
} from "@repo/validation";
import getS3Client from "../../../../../lib/getS3Client";
import { CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";

const app = new OpenAPIHono<Env>();

// === Route 4: Complete Multipart Upload ===
const completeMultipartRoute = createRoute({
  method: "post",
  path: "/",
  request: {
    params: z.object({ uploadId: z.string() }),
    query: z.object({ key: z.string() }),
    body: {
      content: {
        "application/json": { schema: CompleteMultipartReqSchema },
      },
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: CompleteMultipartResSchema } },
      description: "업로드 완료 처리 성공",
    },
    500: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "서버 에러",
    },
  },
});

app.openapi(completeMultipartRoute, async (c) => {
  const { uploadId } = c.req.valid("param");
  const { key } = c.req.valid("query");
  const { parts } = c.req.valid("json");
  const s3 = getS3Client(c.env);

  try {
    const command = new CompleteMultipartUploadCommand({
      Bucket: c.env.R2_BUCKET,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts },
    });

    const data = await s3.send(command);
    return c.json({ location: data.Location }, 200);
  } catch (err: any) {
    return c.json({ code: 500, message: err.message }, 500);
  }
});

export default app;
