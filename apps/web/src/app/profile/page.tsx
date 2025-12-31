import { getApiClient } from "../../lib/server/getApiClient";
import SignOutButton from "./sign-out-button";
import { cookies } from "next/headers";

export default async function ProfilePage() {
  const cookieStore = await cookies();

  // 2. 'session'이라는 이름의 쿠키 값 가져오기
  // (실제 저장한 쿠키 이름이 다르면 'session' 부분을 수정하세요)
  const sessionCookie = cookieStore.get("session");

  // 쿠키가 없으면 로그인 안 된 상태이므로 처리 (예: 리다이렉트)
  if (!sessionCookie) {
    return <div>Unauthorized 401</div>;
  }

  const client = await getApiClient();
  const userInfoReq = await client.auth.me.$get(
    {}, // path param이나 query param이 없으면 빈 객체
    {
      headers: {
        // [핵심] 'Cookie' 헤더를 직접 만들어서 전달해야 함
        Cookie: `${sessionCookie.name}=${sessionCookie.value}`,
      },
    },
  );
  if (!userInfoReq.ok) {
    return <div>Can not found user data</div>;
  }
  const userData = await userInfoReq.json();

  return (
    <div
      className={
        "w-screen h-screen flex items-center justify-center flex-col p-8"
      }
    >
      <div>Profile Page</div>
      <div>{userData.email}</div>
      <SignOutButton />
    </div>
  );
}
