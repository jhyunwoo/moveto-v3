import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { CreateMultipartUploadCommand } from "@aws-sdk/client-s3";
import Env from "../../../lib/env";
import getS3Client from "../../../lib/getS3Client";
import {
  CreateMultipartReqSchema,
  CreateMultipartResSchema,
  ErrorSchema,
} from "@repo/validation";
import uploadIdApp from "./{uploadId}";

const app = new OpenAPIHono<Env>();

app.route("/{uploadId}", uploadIdApp);

const createMultipartRoute = createRoute({
  method: "post",
  path: "/",
  request: {
    body: {
      content: {
        "application/json": { schema: CreateMultipartReqSchema },
      },
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: CreateMultipartResSchema } },
      description: "Multipart Upload 시작 성공",
    },
    500: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "서버 에러",
    },
  },
});

app.openapi(createMultipartRoute, async (c) => {
  const { filename, type, metadata } = c.req.valid("json");
  const s3 = getS3Client(c.env);
  const key = `${crypto.randomUUID()}-${filename}`;

  try {
    const command = new CreateMultipartUploadCommand({
      Bucket: c.env.R2_BUCKET,
      Key: key,
      ContentType: type,
      Metadata: metadata,
    });
    const data = await s3.send(command);

    return c.json({ key: data.Key!, uploadId: data.UploadId! }, 200);
  } catch (err: any) {
    return c.json({ code: 500, message: err.message }, 500);
  }
});

export default app;
