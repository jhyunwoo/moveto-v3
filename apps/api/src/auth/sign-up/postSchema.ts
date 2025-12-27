import { z } from "@hono/zod-openapi";

export const SignUpReqSchema = z
  .object({
    username: z
      .string()
      .min(3, "사용자 이름은 최소 3자 이상이어야 합니다.")
      .max(30, "사용자 이름은 30자를 초과할 수 없습니다.")
      .regex(/^[a-zA-Z0-9_-]+$/, "영문, 숫자, _, - 만 허용됩니다.")
      .openapi({
        example: "hono_user",
      }),

    email: z.string().email("유효한 이메일 형식이 아닙니다.").max(255).openapi({
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

    // ✅ 추가된 필드
    passwordConfirm: z.string().openapi({
      example: "StrongP@ssw0rd123!",
      description: "비밀번호 재입력 (위의 비밀번호와 일치해야 함)",
    }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["passwordConfirm"], // 에러가 발생했을 때 이 필드(passwordConfirm)에 빨간 줄을 긋기 위함
  });

export const SignUpResSchema = z.object({
  result: z.string(),
});
