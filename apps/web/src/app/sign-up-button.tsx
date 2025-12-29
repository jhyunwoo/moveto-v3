"use client";

export default function SignUpButton() {
  return (
    <button
      onClick={async () => {
        await fetch("http://localhost:8787/auth/sign-up", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "jhyunwoo",
            email: "jhyunwoo0228@gmail.com",
            password: "rhdiddl@MOV63",
            passwordConfirm: "rhdiddl@MOV63",
          }),
        });
      }}
    >
      Sign Up
    </button>
  );
}
