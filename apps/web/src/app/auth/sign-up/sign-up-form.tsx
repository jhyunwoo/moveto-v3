"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { SignUpReqType } from "@repo/validation";
import clientApi from "../../../lib/client/clientApi";
import { useRouter } from "next/navigation";

export default function SignUpForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpReqType>();
  const router = useRouter();

  const onSubmit: SubmitHandler<SignUpReqType> = async (data) => {
    const reqSignUp = await clientApi.auth.signUp.$post({ json: data });
    const result = await reqSignUp.json();
    console.log(result);
    router.replace("/profile");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={"flex flex-col w-full max-w-4xl gap-2"}
    >
      <input
        {...register("username", { required: true })}
        placeholder={"Username"}
      />
      <input {...register("email", { required: true })} placeholder={"Email"} />

      <input
        type={"password"}
        {...register("password", { required: true })}
        placeholder={"Password"}
      />
      <input
        type={"password"}
        {...register("passwordConfirm", { required: true })}
        placeholder={"Password Confirm"}
      />

      <button
        className={"p-2 rounded-lg bg-neutral-950 text-neutral-50"}
        type={"submit"}
      >
        Sign Up
      </button>
    </form>
  );
}
