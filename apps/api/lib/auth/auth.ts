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
    path: string;
    secure: boolean;
    httpOnly: boolean;
    maxAge: number;
  };

  constructor(c: Context<Env>) {
    this.c = c;
    this.COOKIE_OPTIONS = {
      path: "/",
      secure: this.c.req.url !== "http://localhost:8787",
      httpOnly: true,
      maxAge: 604800, // 7일
    };
  }

  async signUp(username: string, password: string, email: string) {
    const db = createDB(this.c.env.db);

    // 1. 이메일 중복 확인
    const checkUniqueEmail = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (checkUniqueEmail.length > 0) {
      throw new HTTPException(400, { message: "User already exist" });
    }

    // 2. 트랜잭션으로 묶어서 처리 (유저 생성 + 비밀번호 저장)
    // D1 등 Drizzle 드라이버가 transaction을 지원한다고 가정
    let userPayload;

    try {
      userPayload = await db.transaction(async (tx) => {
        // (1) 유저 생성
        const [newUser] = await tx
          .insert(usersTable)
          .values({ name: username, email: email })
          .returning({
            userId: usersTable.id,
            email: usersTable.email,
            plan: usersTable.plan,
            createdAt: usersTable.createdAt,
          });

        if (!newUser) {
          throw new Error("Failed to create user");
        }

        // (2) 비밀번호 해싱 및 저장
        const hash = await hashPassword(this.c.env.hash, password);
        await tx
          .insert(passwordsTable)
          .values({ userId: newUser.userId, hashedPassword: hash });

        return newUser;
      });
    } catch (e) {
      console.error(e);
      // 트랜잭션이 실패하면 자동으로 롤백되므로 별도 삭제 로직 불필요
      throw new HTTPException(500, { message: "Failed to sign up" });
    }

    // 3. 세션 생성
    const session = new SessionManager(this.c.env.session_kv);
    const sessionId = await session.create(userPayload);

    // 4. 쿠키 설정 (옵션 상수 사용)
    setCookie(this.c, "session", sessionId, this.COOKIE_OPTIONS);

    return { result: "Success" };
  }

  async signIn(email: string, password: string) {
    const db = createDB(this.c.env.db);

    const checkEmailAndPassword = (
      await db
        .select({
          userId: usersTable.id,
          plan: usersTable.plan,
          email: usersTable.email,
          createdAt: usersTable.createdAt,
          hashedPassword: passwordsTable.hashedPassword,
        })
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .innerJoin(passwordsTable, eq(usersTable.id, passwordsTable.userId))
    )[0];

    // 유저가 없거나 비밀번호 정보가 없는 경우
    if (!checkEmailAndPassword) {
      throw new HTTPException(400, {
        message: "Email or Password is incorrect",
      });
    }

    const checkPassword = await verifyPassword(
      this.c.env.hash,
      password,
      checkEmailAndPassword.hashedPassword,
    );

    if (!checkPassword) {
      throw new HTTPException(400, {
        message: "Email or Password is incorrect",
      });
    }

    const session = new SessionManager(this.c.env.session_kv);
    const userPayload = {
      userId: checkEmailAndPassword.userId,
      email: checkEmailAndPassword.email,
      createdAt: checkEmailAndPassword.createdAt,
      plan: checkEmailAndPassword.plan,
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
