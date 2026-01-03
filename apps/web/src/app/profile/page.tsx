import SignOutButton from "./sign-out-button";
import { cookies } from "next/headers";
import { getMeData } from "../../lib/server/getMeData";
import { Suspense } from "react";

export default async function ProfilePage() {
  const cookieStore = await cookies();

  // 2. 'session'이라는 이름의 쿠키 값 가져오기
  // (실제 저장한 쿠키 이름이 다르면 'session' 부분을 수정하세요)
  const sessionCookie = cookieStore.get("session");
  // 쿠키가 없으면 로그인 안 된 상태이므로 처리 (예: 리다이렉트)
  if (!sessionCookie) {
    return <div>No Cookie</div>;
  }

  return (
    <div
      className={
        "w-screen h-screen flex items-center justify-center flex-col p-8"
      }
    >
      <Suspense
        fallback={
          <div className={"w-24 h-10 bg-sky-900 rounded-lg animate-pulse"} />
        }
      >
        <ProfileData sessionId={sessionCookie.value} />
      </Suspense>
      <SignOutButton />
    </div>
  );
}

async function ProfileData({ sessionId }: { sessionId: string }) {
  const userData = await getMeData(sessionId);

  if (!userData) {
    return <div>Can not found user data</div>;
  }
  return (
    <>
      <div>Profile Page</div>
      <div>{userData.email}</div>
    </>
  );
}
