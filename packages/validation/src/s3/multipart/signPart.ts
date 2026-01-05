// [GET] Sign Part (Presigned URL)
import { z } from "@hono/zod-openapi";

const SignPartQuerySchema = z.object({
  key: z.string().min(1),
});

const SignPartParamSchema = z.object({
  uploadId: z.string(),
  partNumber: z
    .string()
    .transform((v) => parseInt(v, 10))
    .refine((v) => v >= 1 && v <= 10000, {
      message: "Part number must be between 1 and 10000",
    }),
});

const SignPartResSchema = z.object({
  url: z.string(),
  expires: z.number(),
});

export { SignPartQuerySchema, SignPartParamSchema, SignPartResSchema };
