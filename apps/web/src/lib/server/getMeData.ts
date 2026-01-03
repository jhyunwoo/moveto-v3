import { getServerApi } from "./getServerApi";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";

export async function getMeData(sessionCookie: RequestCookie) {
  const client = await getServerApi();

  const userInfoReq = await client.auth.me.$get(
    {},
    {
      headers: {
        Cookie: `${sessionCookie.name}=${sessionCookie.value}`,
      },
    },
  );

  if (!userInfoReq.ok) {
    return undefined;
  }

  return await userInfoReq.json();
}
