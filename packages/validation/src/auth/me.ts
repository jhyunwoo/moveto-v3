import { z } from "@hono/zod-openapi";

export const MeResSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.email(),
  plan: z.enum(["free", "plus", "pro"]),
});

export type UserPlanType = z.infer<typeof MeResSchema>["plan"];
export type MeResType = z.infer<typeof MeResSchema>;
