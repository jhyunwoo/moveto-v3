import { z } from "@hono/zod-openapi";

export const BaseResSchema = z.object({
  message: z.string(),
});
