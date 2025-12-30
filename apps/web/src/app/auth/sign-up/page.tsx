import SignUpForm from "./sign-up-form";

export default function SignUpPage() {
  return (
    <div
      className={
        "flex w-screen h-screen flex-col items-center justify-center p-8"
      }
    >
      <div>Sign Up page</div>
      <SignUpForm />
    </div>
  );
}
