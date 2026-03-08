import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { ENV } from "./_core/env";
import { getDb } from "./db";
import { kakaoUsers, naverUsers, emailUsers } from "../drizzle/schema";
import { eq, or } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import * as crypto from "crypto";

// JWT 시크릿 (세션용)
const JWT_SECRET = new TextEncoder().encode(ENV.cookieSecret || "soozip-secret-key-2024");

// 임시 토큰 생성 (소셜 신규 회원 - 약관 동의 전)
async function createTempToken(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("10m")
    .sign(JWT_SECRET);
}

// 임시 토큰 검증
async function verifyTempToken(token: string) {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload;
}

// 비밀번호 해시
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "soozip_salt_2024").digest("hex");
}

// 닉네임 중복 확인 (전체 테이블)
async function isNicknameTaken(nickname: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const [kakao, naver, email] = await Promise.all([
    db.select().from(kakaoUsers).where(eq(kakaoUsers.nickname, nickname)).limit(1),
    db.select().from(naverUsers).where(eq(naverUsers.nickname, nickname)).limit(1),
    db.select().from(emailUsers).where(eq(emailUsers.nickname, nickname)).limit(1),
  ]);
  return kakao.length > 0 || naver.length > 0 || email.length > 0;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    /**
     * 소셜 로그인 (카카오/네이버)
     * 1. 인가 코드로 액세스 토큰 교환
     * 2. 사용자 정보 조회
     * 3. 신규/기존 회원 판별
     */
    socialLogin: publicProcedure
      .input(z.object({
        code: z.string(),
        provider: z.enum(["kakao", "naver"]),
        redirectUri: z.string(),
        state: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { code, provider, redirectUri } = input;
        const db = await getDb();
        if (!db) throw new Error("데이터베이스 연결 오류");

        if (provider === "kakao") {
          // 1. 카카오 액세스 토큰 교환
          const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              client_id: ENV.kakaoRestApiKey,
              redirect_uri: redirectUri,
              code,
            }),
          });
          if (!tokenRes.ok) throw new Error("카카오 토큰 교환 실패");
          const tokenData = await tokenRes.json() as { access_token: string };

          // 2. 카카오 사용자 정보 조회
          const userRes = await fetch("https://kapi.kakao.com/v2/user/me", {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          });
          if (!userRes.ok) throw new Error("카카오 사용자 정보 조회 실패");
          const userData = await userRes.json() as {
            id: number;
            kakao_account?: { email?: string; profile?: { nickname?: string; profile_image_url?: string } };
          };

          const kakaoId = String(userData.id);
          const email = userData.kakao_account?.email ?? null;
          const profileImageUrl = userData.kakao_account?.profile?.profile_image_url ?? null;
          const kakaoNickname = userData.kakao_account?.profile?.nickname ?? null;

          // 3. 기존 회원 확인
          const existing = await db.select().from(kakaoUsers).where(eq(kakaoUsers.kakaoId, kakaoId)).limit(1);
          if (existing.length > 0) {
            // 기존 회원 - 마지막 로그인 시간 업데이트
            await db.update(kakaoUsers).set({ lastSignedIn: new Date() }).where(eq(kakaoUsers.kakaoId, kakaoId));
            return { isNewUser: false, provider: "kakao", userId: existing[0].id };
          }

          // 신규 회원 - 임시 토큰 발급 (약관 동의 화면으로)
          const tempToken = await createTempToken({
            provider: "kakao",
            kakaoId,
            email,
            profileImageUrl,
            suggestedNickname: kakaoNickname,
          });
          return { isNewUser: true, provider: "kakao", tempToken };

        } else {
          // 네이버
          // 1. 네이버 액세스 토큰 교환
          const tokenRes = await fetch("https://nid.naver.com/oauth2.0/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              client_id: ENV.naverClientId,
              client_secret: ENV.naverClientSecret,
              redirect_uri: redirectUri,
              code,
              state: input.state ?? "",
            }),
          });
          if (!tokenRes.ok) throw new Error("네이버 토큰 교환 실패");
          const tokenData = await tokenRes.json() as { access_token: string };

          // 2. 네이버 사용자 정보 조회
          const userRes = await fetch("https://openapi.naver.com/v1/nid/me", {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          });
          if (!userRes.ok) throw new Error("네이버 사용자 정보 조회 실패");
          const userData = await userRes.json() as {
            response: { id: string; email?: string; nickname?: string; profile_image?: string };
          };

          const naverId = userData.response.id;
          const email = userData.response.email ?? null;
          const profileImageUrl = userData.response.profile_image ?? null;
          const naverNickname = userData.response.nickname ?? null;

          // 3. 기존 회원 확인
          const existing = await db.select().from(naverUsers).where(eq(naverUsers.naverId, naverId)).limit(1);
          if (existing.length > 0) {
            await db.update(naverUsers).set({ lastSignedIn: new Date() }).where(eq(naverUsers.naverId, naverId));
            return { isNewUser: false, provider: "naver", userId: existing[0].id };
          }

          const tempToken = await createTempToken({
            provider: "naver",
            naverId,
            email,
            profileImageUrl,
            suggestedNickname: naverNickname,
          });
          return { isNewUser: true, provider: "naver", tempToken };
        }
      }),

    /**
     * 소셜 회원가입 완료 (약관 동의 + 닉네임 설정)
     */
    socialSignup: publicProcedure
      .input(z.object({
        tempToken: z.string(),
        nickname: z.string().min(2).max(20),
        termsAgreed: z.boolean(),
        privacyAgreed: z.boolean(),
        marketingAgreed: z.boolean(),
        ageAgreed: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("데이터베이스 연결 오류");

        if (!input.termsAgreed || !input.privacyAgreed) {
          throw new Error("필수 약관에 동의해주세요.");
        }

        // 임시 토큰 검증
        let payload: Record<string, unknown>;
        try {
          payload = await verifyTempToken(input.tempToken) as Record<string, unknown>;
        } catch {
          throw new Error("인증 세션이 만료되었습니다. 다시 로그인해주세요.");
        }

        // 닉네임 중복 확인
        const taken = await isNicknameTaken(input.nickname);
        if (taken) throw new Error("이미 사용 중인 닉네임입니다.");

        const provider = payload.provider as string;
        if (provider === "kakao") {
          await db.insert(kakaoUsers).values({
            kakaoId: payload.kakaoId as string,
            nickname: input.nickname,
            email: (payload.email as string | null) ?? null,
            profileImageUrl: (payload.profileImageUrl as string | null) ?? null,
            termsAgreed: input.termsAgreed,
            privacyAgreed: input.privacyAgreed,
            marketingAgreed: input.marketingAgreed,
            ageAgreed: input.ageAgreed,
          });
        } else if (provider === "naver") {
          await db.insert(naverUsers).values({
            naverId: payload.naverId as string,
            nickname: input.nickname,
            email: (payload.email as string | null) ?? null,
            profileImageUrl: (payload.profileImageUrl as string | null) ?? null,
            termsAgreed: input.termsAgreed,
            privacyAgreed: input.privacyAgreed,
            marketingAgreed: input.marketingAgreed,
            ageAgreed: input.ageAgreed,
          });
        } else {
          throw new Error("지원하지 않는 소셜 로그인 방식입니다.");
        }

        return { success: true };
      }),

    /**
     * 닉네임 중복 확인
     */
    checkNickname: publicProcedure
      .input(z.object({ nickname: z.string().min(2).max(20) }))
      .query(async ({ input }) => {
        const taken = await isNicknameTaken(input.nickname);
        return { available: !taken };
      }),

    /**
     * 이메일 회원가입
     */
    emailSignup: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(8),
        nickname: z.string().min(2).max(20),
        termsAgreed: z.boolean(),
        privacyAgreed: z.boolean(),
        marketingAgreed: z.boolean(),
        ageAgreed: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("데이터베이스 연결 오류");

        if (!input.termsAgreed || !input.privacyAgreed) {
          throw new Error("필수 약관에 동의해주세요.");
        }

        // 이메일 중복 확인
        const existingEmail = await db.select().from(emailUsers).where(eq(emailUsers.email, input.email)).limit(1);
        if (existingEmail.length > 0) throw new Error("이미 가입된 이메일입니다.");

        // 닉네임 중복 확인
        const taken = await isNicknameTaken(input.nickname);
        if (taken) throw new Error("이미 사용 중인 닉네임입니다.");

        const passwordHash = hashPassword(input.password);
        await db.insert(emailUsers).values({
          email: input.email,
          passwordHash,
          nickname: input.nickname,
          termsAgreed: input.termsAgreed,
          privacyAgreed: input.privacyAgreed,
          marketingAgreed: input.marketingAgreed,
          ageAgreed: input.ageAgreed,
        });

        return { success: true };
      }),

    /**
     * 이메일 로그인
     */
    emailLogin: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("데이터베이스 연결 오류");

        const passwordHash = hashPassword(input.password);
        const user = await db.select().from(emailUsers)
          .where(eq(emailUsers.email, input.email))
          .limit(1);

        if (user.length === 0 || user[0].passwordHash !== passwordHash) {
          throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        await db.update(emailUsers).set({ lastSignedIn: new Date() }).where(eq(emailUsers.email, input.email));
        return { success: true, userId: user[0].id, nickname: user[0].nickname };
      }),
  }),
});

export type AppRouter = typeof appRouter;
