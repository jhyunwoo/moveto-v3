import { z } from "@hono/zod-openapi";

const CompleteMultipartReqSchema = z.object({
  parts: z.array(
    z.object({
      PartNumber: z.number(),
      ETag: z.string(),
    }),
  ),
});

const CompleteMultipartResSchema = z.object({
  location: z.string().optional(),
});

export { CompleteMultipartResSchema, CompleteMultipartReqSchema };
