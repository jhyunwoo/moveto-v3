import { z } from "@hono/zod-openapi";

export const HealthResSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
});

export type HealthResType = z.infer<typeof HealthResSchema>;
