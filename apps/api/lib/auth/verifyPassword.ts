export default async function verifyPassword(
  hashWorker: Fetcher,
  password: string,
  hash: string,
): Promise<boolean> {
  const hashRequest = await hashWorker.fetch("http://internal/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // JSON 전송임을 명시
    },
    body: JSON.stringify({ text: password, hash: hash }), // 객체를 문자열로 변환
  });
  const hashResult = (await hashRequest.json()) as { valid: boolean };
  return hashResult.valid;
}
