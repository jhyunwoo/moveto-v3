"use client";

import clientApi from "../../lib/client/clientApi";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();
  async function handleSignOut() {
    const signOutReq = await clientApi.auth.signOut.$put();
    if (!signOutReq.ok) {
      alert("Sign out Error");
      return;
    }
    router.push("/auth/sign-in");
  }
  return (
    <button onClick={handleSignOut} type={"button"}>
      Sign Out
    </button>
  );
}
