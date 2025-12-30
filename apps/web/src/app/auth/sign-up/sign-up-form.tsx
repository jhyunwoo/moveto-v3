"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { SignUpReqType } from "@repo/validation";
import clientApi from "../../../lib/client/clientApi";

export default function SignUpForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpReqType>();

  const onSubmit: SubmitHandler<SignUpReqType> = async (data) => {
    const reqSignUp = await clientApi.auth.signUp.$post({ json: data });
    const result = await reqSignUp.json();
    console.log(result);
  };

  console.log(watch("email")); // watch input value by passing the name of it

  return (
    /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={"flex flex-col w-full max-w-4xl"}
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
