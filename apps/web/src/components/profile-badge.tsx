import { getMeData } from "../lib/server/getMeData";
import { cookies } from "next/headers";
import { Suspense } from "react";
import Link from "next/link";
import { cn } from "../lib/client/classNameMerge";

const badgeClassName =
  "fixed top-4 right-4 p-2 px-4 rounded-full bg-sky-50 text-sm hover:bg-sky-100 z-10 border-2 border-sky-900";

export default function ProfileBadge() {
  return (
    <Suspense
      fallback={
        <div
          className={cn(badgeClassName, "w-28 h-10 bg-sky-900 animate-pulse")}
        />
      }
    >
      <ProfileButton />
    </Suspense>
  );
}

async function ProfileButton() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie) {
    return <SignButton className={badgeClassName} signUp={true} />;
  }

  const userData = await getMeData(sessionCookie.value);
  if (!userData) {
    return <SignButton className={badgeClassName} signIn={true} />;
  }

  return (
    <Link href={"/profile"} className={badgeClassName}>
      <div>{userData.username}</div>
    </Link>
  );
}

function SignButton({
  className,
  signIn,
  signUp,
}: {
  className: string;
  signIn?: boolean;
  signUp?: boolean;
}) {
  return (
    <Link
      href={`/auth/${(signIn && "sign-in") || (signUp && "sign-up")}`}
      className={className}
    >
      <div>{(signIn && "Sign In") || (signUp && "Sign Up")}</div>
    </Link>
  );
}
