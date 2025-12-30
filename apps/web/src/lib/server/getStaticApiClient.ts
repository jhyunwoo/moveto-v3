import { hc } from "hono/client";
import type { AppType } from "api"; // API 프로젝트에서 타입 import
import { getCloudflareContext } from "@opennextjs/cloudflare"; // OpenNext 설정에 따라 import 경로가 다를 수 있음

export const getStaticApiClient = async () => {
  // 1. Cloudflare Env 가져오기 (OpenNext 버전에 따라 방식이 다를 수 있음)
  const { env } = await getCloudflareContext({ async: true });

  // 2. Service Binding이 존재하는지 확인
  if (!env.api) {
    throw new Error("API_SERVICE binding is missing");
  }

  // 3. Service Binding을 사용해 hc 초기화
  // 첫 번째 인자 URL은 Service Binding 사용 시 실제로는 무시되지만, URL 파싱을 위해 형식적인 URL(http://internal)을 넣습니다.

  return hc<AppType>("http://internal", {
    fetch: env.api.fetch.bind(env.api), // .bind()가 중요합니다!
  });
};
