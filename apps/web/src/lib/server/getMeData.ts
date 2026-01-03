import { getServerApi } from "./getServerApi";

export async function getMeData(sessionId: string) {
  const client = await getServerApi();

  const userInfoReq = await client.auth.me.$get(
    {},
    {
      headers: {
        Cookie: `session=${sessionId}`,
      },
    },
  );

  if (!userInfoReq.ok) {
    return undefined;
  }

  return await userInfoReq.json();
}
