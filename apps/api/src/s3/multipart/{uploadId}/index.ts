import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import Env from "../../../../lib/env";
import getS3Client from "../../../../lib/getS3Client";
import { AbortMultipartUploadCommand } from "@aws-sdk/client-s3";
import {
  AbortMultipartUploadParamsSchema,
  AbortMultipartUploadQuerySchema,
  ErrorSchema,
} from "@repo/validation";
import completeApp from "./complete";
import partNumberApp from "./{partNumber}";

const app = new OpenAPIHono<Env>();

app.route("/complete", completeApp).route("/{partNumber}", partNumberApp);

const abortMultipartRoute = createRoute({
  method: "delete",
  path: "/",
  request: {
    params: AbortMultipartUploadParamsSchema,
    query: AbortMultipartUploadQuerySchema,
  },
  responses: {
    200: {
      description: "업로드 취소 성공",
    },
    500: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "서버 에러",
    },
  },
});

app.openapi(abortMultipartRoute, async (c) => {
  const { uploadId } = c.req.valid("param");
  const { key } = c.req.valid("query");
  const s3 = getS3Client(c.env);

  try {
    const command = new AbortMultipartUploadCommand({
      Bucket: c.env.R2_BUCKET,
      Key: key,
      UploadId: uploadId,
    });

    await s3.send(command);
    return c.json({}, 200);
  } catch (err: any) {
    return c.json({ code: 500, message: err.message }, 500);
  }
});

export default app;
