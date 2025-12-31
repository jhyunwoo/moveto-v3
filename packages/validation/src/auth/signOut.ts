import { z } from "@hono/zod-openapi";

export const SignOutResSchema = z.object({
  result: z.string(),
});

export type SignOutResType = z.infer<typeof SignOutResSchema>;
