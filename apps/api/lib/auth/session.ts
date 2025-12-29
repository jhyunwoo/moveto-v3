// 1. Plan 타입 정의 (오타 방지 및 자동완성용)
export type UserPlan = "free" | "plus" | "pro";

// 2. 세션 데이터 인터페이스 수정 (role -> plan)
export interface SessionPayload {
  userId: string;
  email: string;
  plan: UserPlan; // 이제 문자열 아무거나가 아닌, 위 3개 중 하나만 들어갈 수 있음
  createdAt: Date;
}

export class SessionManager {
  private kv: KVNamespace;
  private readonly prefix: string;
  private readonly defaultTtl: number;

  constructor(kv: KVNamespace, options?: { prefix?: string; ttl?: number }) {
    this.kv = kv;
    this.prefix = options?.prefix ?? "sess:";
    this.defaultTtl = options?.ttl ?? 60 * 60 * 24 * 7;
  }

  private getKey(sessionId: string) {
    return `${this.prefix}${sessionId}`;
  }

  /**
   * 세션 생성
   */
  async create(payload: SessionPayload, ttlSeconds?: number): Promise<string> {
    const sessionId = crypto.randomUUID();
    const key = this.getKey(sessionId);
    const ttl = ttlSeconds ?? this.defaultTtl;

    await this.kv.put(key, JSON.stringify(payload), {
      expirationTtl: ttl,
    });

    return sessionId;
  }

  /**
   * 세션 조회
   */
  async get(sessionId: string): Promise<SessionPayload | null> {
    const key = this.getKey(sessionId);
    return await this.kv.get<SessionPayload>(key, "json");
  }

  /**
   * 세션 삭제
   */
  async destroy(sessionId: string): Promise<void> {
    const key = this.getKey(sessionId);
    await this.kv.delete(key);
  }

  /**
   * 세션 연장
   */
  async refresh(sessionId: string, ttlSeconds?: number): Promise<boolean> {
    const payload = await this.get(sessionId);
    if (!payload) return false;

    const key = this.getKey(sessionId);
    const ttl = ttlSeconds ?? this.defaultTtl;

    await this.kv.put(key, JSON.stringify(payload), {
      expirationTtl: ttl,
    });

    return true;
  }
}
