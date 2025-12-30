import SignInForm from "./sign-in-form";

export default function SignInPage() {
  return (
    <div
      className={
        "flex w-screen h-screen flex-col items-center justify-center p-8"
      }
    >
      <div>Sign In page</div>
      <SignInForm />
    </div>
  );
}
