"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { SignInReqType } from "@repo/validation";
import clientApi from "../../../lib/client/clientApi";

export default function SignInForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInReqType>();

  const onSubmit: SubmitHandler<SignInReqType> = async (data) => {
    const reqSignIn = await clientApi.auth.signIn.$post({ json: data });
    const result = await reqSignIn.json();
    console.log(result);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={"flex flex-col w-full max-w-4xl gap-2"}
    >
      <input {...register("email", { required: true })} placeholder={"Email"} />

      <input
        type={"password"}
        {...register("password", { required: true })}
        placeholder={"Password"}
      />

      <button
        className={"p-2 rounded-lg bg-neutral-950 text-neutral-50"}
        type={"submit"}
      >
        Sign In
      </button>
    </form>
  );
}
