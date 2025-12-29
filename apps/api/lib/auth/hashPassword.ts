/**
 * 비밀번호를 argon2id 해시 함수를 사용하여 해시한 결과를 반환하는 함수
 * @param hashWorker - argon2id로 해시를 진행하는 worker
 * @param password - 해시하고자 하는 비밀번호
 */
export default async function hashPassword(
  hashWorker: Fetcher,
  password: string,
): Promise<string> {
  const hashRequest = await hashWorker.fetch("http://internal", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // JSON 전송임을 명시
    },
    body: JSON.stringify({ text: password }), // 객체를 문자열로 변환
  });
  const hashResult = (await hashRequest.json()) as { hash: string };
  return hashResult.hash;
}
