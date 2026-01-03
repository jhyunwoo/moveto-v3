import createDB from "../db";
import { passwordsTable, usersTable } from "../db/schema";
import { eq } from "drizzle-orm";
import { SessionManager } from "./session";
import hashPassword from "./hashPassword";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { Context } from "hono";
import verifyPassword from "./verifyPassword";
import Env from "../env";
import { HTTPException } from "hono/http-exception";

class AuthManager {
  // c 타입을 명확히 지정하여 c.env 접근 시 타입 추론 지원
  c: Context<Env>;
  COOKIE_OPTIONS: {
    domain?: string;
    path: string;
    secure: boolean;
    httpOnly: boolean;
    maxAge: number;
    sameSite: "lax" | "none" | "strict";
  };

  constructor(c: Context<Env>) {
    this.c = c;
    const isLocal =
      c.req.url.includes("localhost") || c.req.url.includes("127.0.0.1");

    this.COOKIE_OPTIONS = {
      domain: isLocal ? undefined : ".moveto.workers.dev",
      path: "/",
      secure: !isLocal,
      httpOnly: !isLocal, // 로컬에서는 값 확인 가능하도록 false
      maxAge: 604800, // 7일
      sameSite: "lax",
    };
  }

  // 수정된 signUp 메서드 (트랜잭션 제거 버전)
  async signUp(username: string, email: string, password: string) {
    const db = createDB(this.c.env.db);

    // 1. 이메일 중복 확인
    const checkUniqueEmail = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (checkUniqueEmail.length > 0) {
      throw new HTTPException(409, { message: "User already exists" });
    }

    let newUser;

    try {
      // (1) 유저 생성
      const result = await db
        .insert(usersTable)
        .values({ name: username, email: email })
        .returning();

      newUser = result[0];

      if (newUser) {
        // (2) 비밀번호 해싱 및 저장
        const hash = await hashPassword(this.c.env.hash, password);
        await db
          .insert(passwordsTable)
          .values({ userId: newUser.id, hashedPassword: hash });
      }
    } catch (e) {
      console.error("SignUp Error:", e);

      // [중요] 수동 롤백: 유저는 생성됐는데 비밀번호 저장 실패 시 유저 삭제
      if (newUser?.id) {
        await db.delete(usersTable).where(eq(usersTable.id, newUser.id));
      }

      throw new HTTPException(500, { message: "Failed to process sign up" });
    }

    if (!newUser)
      throw new HTTPException(500, { message: '"Failed to create user"' });

    // 3. 세션 생성 및 쿠키 설정 (기존 로직 유지)
    const session = new SessionManager(this.c.env.session_kv);
    const userPayload = {
      username: newUser?.name,
      userId: newUser?.id,
      email: newUser?.email,
      plan: newUser?.plan,
      createdAt: newUser?.createdAt,
    };
    const sessionId = await session.create(userPayload);
    setCookie(this.c, "session", sessionId, this.COOKIE_OPTIONS);

    return { result: "Success" };
  }

  async signIn(email: string, password: string) {
    const db = createDB(this.c.env.db);
    const [emailAndPassword] = await db
      .select({
        username: usersTable.name,
        userId: usersTable.id,
        plan: usersTable.plan,
        email: usersTable.email,
        createdAt: usersTable.createdAt,
        hashedPassword: passwordsTable.hashedPassword,
      })
      .from(usersTable)
      .innerJoin(passwordsTable, eq(usersTable.id, passwordsTable.userId))
      .where(eq(usersTable.email, email));

    // 유저가 없거나 비밀번호 정보가 없는 경우
    if (!emailAndPassword) {
      throw new HTTPException(400, {
        message: "Email or Password is incorrect",
      });
    }

    const checkPassword = await verifyPassword(
      this.c.env.hash,
      password,
      emailAndPassword.hashedPassword,
    );

    if (!checkPassword) {
      throw new HTTPException(400, {
        message: "Email or Password is incorrect",
      });
    }

    const session = new SessionManager(this.c.env.session_kv);
    const userPayload = {
      username: emailAndPassword.username,
      userId: emailAndPassword.userId,
      email: emailAndPassword.email,
      createdAt: emailAndPassword.createdAt,
      plan: emailAndPassword.plan,
    };

    const newSession = await session.create(userPayload);

    // [중요 수정] signIn에서도 옵션을 동일하게 적용해야 함!
    setCookie(this.c, "session", newSession, this.COOKIE_OPTIONS);

    this.c.set("session", userPayload);

    return { result: "Success" };
  }

  async signOut() {
    const sessionId = getCookie(this.c, "session");
    if (!sessionId) {
      return { result: "Success" };
    }

    const session = new SessionManager(this.c.env.session_kv);
    await session.destroy(sessionId);

    deleteCookie(this.c, "session", this.COOKIE_OPTIONS);
    this.c.set("session", undefined);

    return { result: "Success" };
  }
}

export default AuthManager;
