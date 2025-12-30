import { z } from "@hono/zod-openapi";

export const SignInReqSchema = z.object({
  email: z.email("유효한 이메일 형식이 아닙니다.").max(255).openapi({
    example: "user@example.com",
  }),
  password: z
    .string()
    .min(8, "비밀번호는 최소 8자 이상이어야 합니다.")
    .max(100)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
      "영문 대/소문자, 숫자, 특수문자를 각각 하나 이상 포함해야 합니다.",
    )
    .openapi({
      example: "StrongP@ssw0rd123!",
      description: "보안 강도가 높은 비밀번호",
    }),
});

export type SignInReqType = z.infer<typeof SignInReqSchema>;

export const SignInResSchema = z.object({
  result: z.string(),
});

export type SignInResResponse = z.infer<typeof SignInResSchema>;
