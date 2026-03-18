import { COOKIE_NAME } from "@shared/const";
import { createClient } from "@supabase/supabase-js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { ENV } from "./_core/env";
import { getDb } from "./db";
import { kakaoUsers, naverUsers, emailUsers, emailVerificationCodes, designers, designerReviews, stylingRequests, stylingBookings, stylingProgress, furnitureInfo } from "../drizzle/schema";
import { storagePut } from "./storage";
import { eq, or, desc, and } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import * as crypto from "crypto";
import { sendVerificationEmail } from "./mailer";

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
          const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              client_id: ENV.kakaoRestApiKey,
              redirect_uri: redirectUri,
              code,
              ...(ENV.kakaoClientSecret ? { client_secret: ENV.kakaoClientSecret } : {}),
            }),
          });
          if (!tokenRes.ok) {
            const errBody = await tokenRes.text().catch(() => "unknown");
            console.error(`[카카오] 토큰 교환 실패: ${tokenRes.status} ${errBody}`);
            throw new Error(`카카오 토큰 교환 실패 (${tokenRes.status})`);
          }
          const tokenData = await tokenRes.json() as { access_token: string; error?: string; error_description?: string };
          if (tokenData.error) {
            console.error(`[카카오] 토큰 에러: ${tokenData.error} - ${tokenData.error_description}`);
            throw new Error(`카카오 인증 오류: ${tokenData.error_description || tokenData.error}`);
          }

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

          const existing = await db.select().from(kakaoUsers).where(eq(kakaoUsers.kakaoId, kakaoId)).limit(1);
          if (existing.length > 0) {
            await db.update(kakaoUsers).set({ lastSignedIn: new Date() }).where(eq(kakaoUsers.kakaoId, kakaoId));
            return {
              isNewUser: false,
              provider: "kakao" as const,
              userId: existing[0].id,
              nickname: existing[0].nickname,
              email: existing[0].email ?? null,
              profileImageUrl: existing[0].profileImageUrl ?? null,
            };
          }

          const tempToken = await createTempToken({
            provider: "kakao",
            kakaoId,
            email,
            profileImageUrl,
            suggestedNickname: kakaoNickname,
          });
          return { isNewUser: true, provider: "kakao", tempToken };

        } else {
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
          if (!tokenRes.ok) {
            const errBody = await tokenRes.text().catch(() => "unknown");
            console.error(`[네이버] 토큰 교환 실패: ${tokenRes.status} ${errBody}`);
            throw new Error(`네이버 토큰 교환 실패 (${tokenRes.status})`);
          }
          const tokenData = await tokenRes.json() as { access_token: string; error?: string; error_description?: string };
          if (tokenData.error) {
            console.error(`[네이버] 토큰 에러: ${tokenData.error} - ${tokenData.error_description}`);
            throw new Error(`네이버 인증 오류: ${tokenData.error_description || tokenData.error}`);
          }

          const userRes = await fetch("https://openapi.naver.com/v1/nid/me", {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          });
          if (!userRes.ok) throw new Error("네이버 사용자 정보 조회 실패");
          const userData = await userRes.json() as {
            response: {
              id: string;
              email?: string;
              nickname?: string;
              profile_image?: string;
              gender?: string;
              birthday?: string;
              age?: string;
            };
          };

          const naverId = userData.response.id;
          const email = userData.response.email ?? null;
          const profileImageUrl = userData.response.profile_image ?? null;
          const naverNickname = userData.response.nickname ?? null;
          const gender = userData.response.gender ?? null;
          const birthday = userData.response.birthday ?? null;
          const age = userData.response.age ?? null;

          const existing = await db.select().from(naverUsers).where(eq(naverUsers.naverId, naverId)).limit(1);
          if (existing.length > 0) {
            await db.update(naverUsers).set({ lastSignedIn: new Date() }).where(eq(naverUsers.naverId, naverId));
            return {
              isNewUser: false,
              provider: "naver" as const,
              userId: existing[0].id,
              nickname: existing[0].nickname,
              email: existing[0].email ?? null,
              profileImageUrl: existing[0].profileImageUrl ?? null,
            };
          }

          const tempToken = await createTempToken({
            provider: "naver",
            naverId,
            email,
            profileImageUrl,
            suggestedNickname: naverNickname,
            gender,
            birthday,
            age,
          });
          return { isNewUser: true, provider: "naver", tempToken };
        }
      }),

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

        let payload: Record<string, unknown>;
        try {
          payload = await verifyTempToken(input.tempToken) as Record<string, unknown>;
        } catch {
          throw new Error("인증 세션이 만료되었습니다. 다시 로그인해주세요.");
        }

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

        return {
          success: true,
          userId: provider === "kakao" ? (payload.kakaoId as string) : (payload.naverId as string),
          email: (payload.email as string | null) ?? null,
          profileImageUrl: (payload.profileImageUrl as string | null) ?? null,
        };
      }),

    checkNickname: publicProcedure
      .input(z.object({ nickname: z.string().min(2).max(20) }))
      .query(async ({ input }) => {
        const taken = await isNicknameTaken(input.nickname);
        return { available: !taken };
      }),

    sendEmailVerification: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("데이터베이스 연결 오류");

        const existingUser = await db.select().from(emailUsers).where(eq(emailUsers.email, input.email)).limit(1);
        if (existingUser.length > 0) throw new Error("이미 가입된 이메일입니다.");

        const code = String(Math.floor(100000 + Math.random() * 900000));
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await db.delete(emailVerificationCodes).where(eq(emailVerificationCodes.email, input.email));
        await db.insert(emailVerificationCodes).values({ email: input.email, code, expiresAt });

        const emailSent = await sendVerificationEmail(input.email, code);

        if (!ENV.isProduction) {
          console.log(`[Dev] 이메일 인증 코드 (${input.email}): ${code}`);
        }

        if (!emailSent) {
          console.warn(`[Email] 이메일 발송 실패 - 코드는 DB에 저장됨: ${input.email}`);
        }

        return { success: true, message: "인증 코드가 발송되었습니다. (10분 유효)" };
      }),

    verifyEmailCode: publicProcedure
      .input(z.object({ email: z.string().email(), code: z.string() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("데이터베이스 연결 오류");

        const record = await db.select().from(emailVerificationCodes)
          .where(eq(emailVerificationCodes.email, input.email))
          .orderBy(desc(emailVerificationCodes.createdAt))
          .limit(1);

        if (record.length === 0) throw new Error("인증 코드를 먼저 요청해주세요.");
        const latest = record[0];
        if (latest.used) throw new Error("이미 사용된 인증 코드입니다.");
        if (new Date() > latest.expiresAt) throw new Error("인증 코드가 만료되었습니다. 다시 요청해주세요.");
        if (latest.code !== input.code) throw new Error("인증 코드가 올바르지 않습니다.");

        await db.update(emailVerificationCodes).set({ used: true }).where(eq(emailVerificationCodes.id, latest.id));
        return { success: true, verified: true };
      }),

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

        const existingEmail = await db.select().from(emailUsers).where(eq(emailUsers.email, input.email)).limit(1);
        if (existingEmail.length > 0) throw new Error("이미 가입된 이메일입니다.");

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
        const newUser = await db.select().from(emailUsers).where(eq(emailUsers.email, input.email)).limit(1);
        return { success: true, userId: newUser[0]?.id ?? 0 };
      }),

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

    /**
     * 프로필 업데이트 (닉네임 + 프로필 이미지)
     * - provider: kakao | naver | email
     * - userId: 해당 테이블의 id
     */
    updateProfile: publicProcedure
      .input(z.object({
        userId: z.number(),
        provider: z.enum(["kakao", "naver", "email"]),
        nickname: z.string().min(2).max(20).optional(),
        profileImageBase64: z.string().optional(), // base64 encoded image
        profileImageMime: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("데이터베이스 연결 오류");

        const updates: Record<string, unknown> = {};

        // 닉네임 변경 처리
        if (input.nickname) {
          const taken = await isNicknameTaken(input.nickname);
          if (taken) throw new Error("이미 사용 중인 닉네임입니다.");
          updates.nickname = input.nickname;
        }

        // 프로필 이미지 업로드 처리
        if (input.profileImageBase64 && input.profileImageMime) {
          const buffer = Buffer.from(input.profileImageBase64, "base64");
          const ext = input.profileImageMime.split("/")[1] ?? "jpg";
          const fileKey = `profile-images/${input.provider}-${input.userId}-${Date.now()}.${ext}`;
          const { url } = await storagePut(fileKey, buffer, input.profileImageMime);
          updates.profileImageUrl = url;
        }

        if (Object.keys(updates).length === 0) {
          throw new Error("변경할 내용이 없습니다.");
        }

        // 각 테이블에 업데이트
        if (input.provider === "kakao") {
          await db.update(kakaoUsers).set(updates as Partial<typeof kakaoUsers.$inferInsert>).where(eq(kakaoUsers.id, input.userId));
          const updated = await db.select().from(kakaoUsers).where(eq(kakaoUsers.id, input.userId)).limit(1);
          return { success: true, nickname: updated[0]?.nickname, profileImageUrl: updated[0]?.profileImageUrl ?? null };
        } else if (input.provider === "naver") {
          await db.update(naverUsers).set(updates as Partial<typeof naverUsers.$inferInsert>).where(eq(naverUsers.id, input.userId));
          const updated = await db.select().from(naverUsers).where(eq(naverUsers.id, input.userId)).limit(1);
          return { success: true, nickname: updated[0]?.nickname, profileImageUrl: updated[0]?.profileImageUrl ?? null };
        } else {
          // emailUsers는 profileImageUrl 콼럼이 없으므로 nickname만 업데이트
          const emailUpdates: Record<string, unknown> = {};
          if (updates.nickname) emailUpdates.nickname = updates.nickname;
          if (Object.keys(emailUpdates).length > 0) {
            await db.update(emailUsers).set(emailUpdates as Partial<typeof emailUsers.$inferInsert>).where(eq(emailUsers.id, input.userId));
          }
          const updated = await db.select().from(emailUsers).where(eq(emailUsers.id, input.userId)).limit(1);
          return { success: true, nickname: updated[0]?.nickname, profileImageUrl: null };
        }
      }),

  }),
  // ─── 디자이너 라우터 ───────────────────────────────────────────────
  designer: router({
    /**
     * 승인된 디자이너 목록 조회 (소비자용)
     */
    list: publicProcedure
      .input(z.object({
        stylingType: z.string().optional(), // 타입 필터
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];

        const allDesigners = await db.select().from(designers)
          .where(eq(designers.status, "approved"))
          .orderBy(desc(designers.createdAt));

        // 타입 필터링 (JSON 배열 문자열 검색)
        let filtered = allDesigners;
        if (input.stylingType) {
          filtered = allDesigners.filter(d => {
            try {
              const specs = JSON.parse(d.specialties ?? "[]") as string[];
              return specs.includes(input.stylingType!);
            } catch { return false; }
          });
        }

        // 각 디자이너의 리뷰 평균 점수 조회
        const result = await Promise.all(filtered.map(async (d) => {
          const reviews = await db.select().from(designerReviews)
            .where(eq(designerReviews.designerId, d.id));
          const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;
          const reviewCount = reviews.length;
          // 최신 리뷰 2개 요약
          const recentReviews = reviews
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 2)
            .map(r => ({ rating: r.rating, comment: r.comment, stylingType: r.stylingType, reviewerNickname: r.reviewerNickname }));

          return {
            ...d,
            specialties: (() => { try { return JSON.parse(d.specialties ?? "[]") as string[]; } catch { return []; } })(),
            portfolioUrls: (() => { try { return JSON.parse(d.portfolioUrls ?? "[]") as string[]; } catch { return []; } })(),
            avgRating: Math.round(avgRating * 10) / 10,
            reviewCount,
            recentReviews,
          };
        }));

        return result;
      }),

    /**
     * 디자이너 상세 조회
     */
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;

        const [designer] = await db.select().from(designers)
          .where(and(eq(designers.id, input.id), eq(designers.status, "approved")))
          .limit(1);

        if (!designer) return null;

        const reviews = await db.select().from(designerReviews)
          .where(eq(designerReviews.designerId, designer.id))
          .orderBy(desc(designerReviews.createdAt));

        const avgRating = reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;

        return {
          ...designer,
          specialties: (() => { try { return JSON.parse(designer.specialties ?? "[]") as string[]; } catch { return []; } })(),
          portfolioUrls: (() => { try { return JSON.parse(designer.portfolioUrls ?? "[]") as string[]; } catch { return []; } })(),
          avgRating: Math.round(avgRating * 10) / 10,
          reviewCount: reviews.length,
          reviews: reviews.map(r => ({
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            stylingType: r.stylingType,
            reviewerNickname: r.reviewerNickname,
            createdAt: r.createdAt,
          })),
        };
      }),

    /**
     * 디자이너 입점 신청
     */
    submitApplication: publicProcedure
      .input(z.object({
        nickname: z.string().min(2).max(50),
        email: z.string().email(),
        bio: z.string().max(200).optional(),
        specialties: z.array(z.string()).min(1),
        applyReason: z.string().min(10).max(1000),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("데이터베이스 연결 오류");

        // 이미 신청한 이메일 확인
        const existing = await db.select().from(designers)
          .where(eq(designers.email, input.email))
          .limit(1);
        if (existing.length > 0) {
          const status = existing[0].status;
          if (status === "pending") throw new Error("이미 입점 신청이 접수되어 검토 중입니다.");
          if (status === "approved") throw new Error("이미 승인된 디자이너 계정입니다.");
          if (status === "rejected") throw new Error("입점 신청이 반려되었습니다. 문의해주세요.");
        }

        await db.insert(designers).values({
          nickname: input.nickname,
          email: input.email,
          bio: input.bio ?? null,
          specialties: JSON.stringify(input.specialties),
          applyReason: input.applyReason,
          status: "pending",
        });

        return { success: true, message: "입점 신청이 접수되었습니다. 검토 후 이메일로 안내드립니다." };
      }),
  }),

  // ─── 스타일링 신청서 라우터 (숨고 방식) ────────────────────────────
  stylingRequest: router({
    /**
     * 신청서 작성 (소비자)
     */
    create: publicProcedure
      .input(z.object({
        requesterNickname: z.string().min(1).max(50),
        requesterEmail: z.string().email().optional(),
        stylingType: z.enum(["배치솔루션", "풀스타일링(온라인)", "풀스타일링(오프라인)"]),
        roomSize: z.string().optional(),
        roomType: z.string().optional(),
        budget: z.string().optional(),
        description: z.string().max(1000).optional(),
        preferredDate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("데이터베이스 연결 오류");

        await db.insert(stylingRequests).values({
          requesterNickname: input.requesterNickname,
          requesterEmail: input.requesterEmail ?? null,
          stylingType: input.stylingType,
          roomSize: input.roomSize ?? null,
          roomType: input.roomType ?? null,
          budget: input.budget ?? null,
          description: input.description ?? null,
          preferredDate: input.preferredDate ?? null,
          status: "waiting",
        });

        return { success: true, message: "신청서가 등록되었습니다. 디자이너가 곧 연락드립니다." };
      }),

    /**
     * 대기 중인 신청서 목록 (디자이너용)
     */
    listWaiting: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];

      return db.select().from(stylingRequests)
        .where(eq(stylingRequests.status, "waiting"))
        .orderBy(desc(stylingRequests.createdAt));
    }),
  }),

  // ─── 스타일링 예약 라우터 (캘린더 방식) ────────────────────────────
  stylingBooking: router({
    /**
     * 예약 생성 (날짜 선택 후 - 설문 전 임시 예약)
     */
    create: publicProcedure
      .input(z.object({
        bookerNickname: z.string().min(1).max(50),
        bookerEmail: z.string().email().optional(),
        stylingType: z.enum(["배치솔루션", "풀스타일링(온라인)", "풀스타일링(오프라인)"]),
        designerId: z.number().optional(),
        preferredDate: z.string(), // YYYY-MM-DD
        preferredTime: z.string().optional(),
        roomSize: z.string().optional(),
        description: z.string().max(500).optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("데이터베이스 연결 오류");

        const [result] = await db.insert(stylingBookings).values({
          bookerNickname: input.bookerNickname,
          bookerEmail: input.bookerEmail ?? null,
          stylingType: input.stylingType,
          designerId: input.designerId ?? null,
          preferredDate: input.preferredDate,
          preferredTime: input.preferredTime ?? null,
          roomSize: input.roomSize ?? null,
          description: input.description ?? null,
          surveyCompleted: false,
          status: "pending",
        });

        // 삽입된 예약 ID 조회
        const newBooking = await db.select().from(stylingBookings)
          .where(and(
            eq(stylingBookings.bookerNickname, input.bookerNickname),
            eq(stylingBookings.preferredDate, input.preferredDate),
          ))
          .orderBy(desc(stylingBookings.createdAt))
          .limit(1);

        return {
          success: true,
          bookingId: newBooking[0]?.id ?? 0,
          message: "예약이 임시 저장되었습니다. 설문을 완료하면 최종 확정됩니다.",
        };
      }),

    /**
     * 설문 완료 처리 (설문 후 최종 예약 확정)
     */
    completeSurvey: publicProcedure
      .input(z.object({ bookingId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("데이터베이스 연결 오류");

        await db.update(stylingBookings)
          .set({ surveyCompleted: true, status: "confirmed" })
          .where(eq(stylingBookings.id, input.bookingId));

        return { success: true, message: "예약이 최종 확정되었습니다!" };
      }),

    /**
     * 예약된 날짜 목록 조회 (캘린더 표시용)
     */
    bookedDates: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];

      const bookings = await db.select({
        preferredDate: stylingBookings.preferredDate,
        status: stylingBookings.status,
      }).from(stylingBookings)
        .where(or(
          eq(stylingBookings.status, "pending"),
          eq(stylingBookings.status, "confirmed"),
        ));

      return bookings;
    }),
  }),

  // ─── 스타일링 진행 상태 라우터 ────────────────────────────
  stylingProgress: router({
    /**
     * 내 스타일링 진행 현황 조회 (로그인 사용자)
     */
    myProgress: publicProcedure
      .input(z.object({ userNickname: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;

        const rows = await db.select().from(stylingProgress)
          .where(and(
            eq(stylingProgress.userNickname, input.userNickname),
            eq(stylingProgress.status, "active"),
          ))
          .orderBy(desc(stylingProgress.createdAt))
          .limit(1);

        return rows[0] ?? null;
      }),

    /**
     * 스타일링 진행 상태 생성 (어드민/테스트용)
     */
    create: publicProcedure
      .input(z.object({
        userNickname: z.string(),
        stylingType: z.enum(["배치솔루션", "풀스타일링(온라인)", "풀스타일링(오프라인)"]),
        bookingId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("데이터베이스 연결 오류");

        const totalStepsMap = {
          "배치솔루션": 5,
          "풀스타일링(온라인)": 6,
          "풀스타일링(오프라인)": 7,
        };

        await db.insert(stylingProgress).values({
          userNickname: input.userNickname,
          stylingType: input.stylingType,
          currentStep: 1,
          totalSteps: totalStepsMap[input.stylingType],
          status: "active",
          bookingId: input.bookingId ?? null,
        });

        return { success: true };
      }),

    /**
     * STEP 진행 (다음 단계로 이동)
     */
    advanceStep: publicProcedure
      .input(z.object({ progressId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("데이터베이스 연결 오류");

        const rows = await db.select().from(stylingProgress)
          .where(eq(stylingProgress.id, input.progressId))
          .limit(1);

        if (!rows[0]) throw new Error("진행 정보를 찾을 수 없습니다.");

        const { currentStep, totalSteps } = rows[0];
        const nextStep = Math.min(currentStep + 1, totalSteps);
        const newStatus = nextStep >= totalSteps ? "completed" : "active";

        await db.update(stylingProgress)
          .set({ currentStep: nextStep, status: newStatus })
          .where(eq(stylingProgress.id, input.progressId));

        return { success: true, nextStep, completed: newStatus === "completed" };
      }),
  }),

  // ─── Supabase 설문조사 연동 라우터 ────────────────────────────
  survey: router({
    /**
     * 로그인 사용자의 userId로 설문조사 신청 내역 조회
     * 반드시 user_id 컬럼으로만 조회 (비로그인 신청자는 null 반환)
     */
    mySubmission: publicProcedure
      .input(z.object({
        userId: z.string().optional(),
      }))
      .query(async ({ input }) => {
        if (!input.userId) return null;

        const supabase = createClient(ENV.surveySupabaseUrl, ENV.surveySupabaseAnonKey);

        const { data, error } = await supabase
          .from("survey_submissions")
          .select("id, name, styling_type, styling_state, step1, step2, step3, step4, step5, step6, step7, step1_m, step2_m, step3_m, step4_m, step5_m, step6_m, step7_m, admin_note, styling_status, created_at")
          .eq("user_id", input.userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error || !data) return null;

        return {
          id: data.id as number,
          name: data.name as string,
          stylingType: data.styling_type as string,
          stylingState: (data.styling_state as number) ?? 1,
          step1: (data.step1 as string) ?? 'pending',
          step2: (data.step2 as string) ?? 'pending',
          step3: (data.step3 as string) ?? 'pending',
          step4: (data.step4 as string) ?? 'pending',
          step5: (data.step5 as string) ?? 'pending',
          step6: (data.step6 as string) ?? 'pending',
          step7: (data.step7 as string) ?? 'pending',
          step1m: (data.step1_m as string) ?? null,
          step2m: (data.step2_m as string) ?? null,
          step3m: (data.step3_m as string) ?? null,
          step4m: (data.step4_m as string) ?? null,
          step5m: (data.step5_m as string) ?? null,
          step6m: (data.step6_m as string) ?? null,
          step7m: (data.step7_m as string) ?? null,
          adminNote: (data.admin_note as string) ?? null,
          stylingStatus: (data.styling_status as string) ?? 'active',
          createdAt: data.created_at as string,
        };
      }),

    /**
     * STEP 사용자 파일 업로드 - Supabase Storage 'soozip_styling_step' 버킷에 저장 후 URL을 step 컬럼에 저장
     */
    uploadStepFile: publicProcedure
      .input(z.object({
        userId: z.string(),
        stepKey: z.enum(['step1', 'step2', 'step3', 'step4', 'step5', 'step6', 'step7']),
        fileBase64: z.string(),   // base64 인코딩된 파일
        fileName: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const supabase = createClient(ENV.surveySupabaseUrl, ENV.surveySupabaseAnonKey);

        // user_id로만 조회 (비로그인 신청자는 파일 업로드 불가)
        const { data: existing } = await supabase
          .from("survey_submissions")
          .select(`id, ${input.stepKey}`)
          .eq("user_id", input.userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (!existing) {
          throw new Error("신청 내역을 찾을 수 없습니다. 로그인 후 신청한 내역만 파일을 업로드할 수 있습니다.");
        }
        const existingRecord = existing as Record<string, unknown>;

        // Supabase Storage 'soozip_styling_step' 버킷에 파일 업로드
        const buffer = Buffer.from(input.fileBase64, 'base64');
        const suffix = Date.now();
        const safeFileName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileKey = `${input.userId}/${input.stepKey}/${suffix}-${safeFileName}`;

        const { error: uploadError } = await supabase.storage
          .from('soozip_styling_step')
          .upload(fileKey, buffer, { contentType: input.mimeType, upsert: false });

        let fileUrl: string;
        if (uploadError) {
          // Supabase Storage 업로드 실패 시 Manus S3 폴백
          console.warn('[uploadStepFile] Supabase Storage 업로드 실패, S3 폴백:', uploadError.message);
          const s3Key = `styling-step/${input.userId}/${input.stepKey}/${suffix}-${safeFileName}`;
          const { url: s3Url } = await storagePut(s3Key, buffer, input.mimeType);
          fileUrl = s3Url;
        } else {
          // Supabase Storage 공개 URL 생성
          const { data: publicUrlData } = supabase.storage
            .from('soozip_styling_step')
            .getPublicUrl(fileKey);
          fileUrl = publicUrlData.publicUrl;
        }

        // 기존 URL 배열에 추가 (text:: 항목 제외한 파일 URL만)
        let existingUrls: string[] = [];
        const raw = (existing as Record<string, unknown>)[input.stepKey];
        if (typeof raw === 'string' && raw !== 'pending' && raw !== 'completed') {
          try { existingUrls = JSON.parse(raw); } catch { existingUrls = [raw]; }
        } else if (Array.isArray(raw)) {
          existingUrls = raw;
        }
        const updatedUrls = [...existingUrls, fileUrl];

        const { error: updateErr } = await supabase
          .from("survey_submissions")
          .update({ [input.stepKey]: JSON.stringify(updatedUrls) })
          .eq("user_id", input.userId);

        if (updateErr) throw new Error("파일 저장에 실패했습니다.");

        return { success: true, url: fileUrl, urls: updatedUrls };
      }),

    /**
     * STEP 파일 삭제 - 특정 URL을 배열에서 제거
     */
    deleteStepFile: publicProcedure
      .input(z.object({
        userId: z.string(),
        stepKey: z.enum(['step1', 'step2', 'step3', 'step4', 'step5', 'step6', 'step7']),
        fileUrl: z.string(),
      }))
      .mutation(async ({ input }) => {
        const supabase = createClient(ENV.surveySupabaseUrl, ENV.surveySupabaseAnonKey);

        const { data: existing } = await supabase
          .from("survey_submissions")
          .select(`id, ${input.stepKey}`)
          .eq("user_id", input.userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (!existing) throw new Error("신청 내역을 찾을 수 없습니다.");

        let existingUrls: string[] = [];
        const raw = (existing as Record<string, unknown>)[input.stepKey];
        if (typeof raw === 'string') {
          try { existingUrls = JSON.parse(raw); } catch { existingUrls = []; }
        } else if (Array.isArray(raw)) {
          existingUrls = raw;
        }
        const updatedUrls = existingUrls.filter(u => u !== input.fileUrl);

        const { error: updateErr } = await supabase
          .from("survey_submissions")
          .update({ [input.stepKey]: updatedUrls.length > 0 ? JSON.stringify(updatedUrls) : 'pending' })
          .eq("user_id", input.userId);

        if (updateErr) throw new Error("파일 삭제에 실패했습니다.");

        return { success: true, urls: updatedUrls };
      }),

    /**
     * STEP 텍스트 저장 - step 컬럼에 텍스트 내용 저장 ("text::내용" 형식)
     */
    updateStepText: publicProcedure
      .input(z.object({
        userId: z.string(),
        stepKey: z.enum(['step1', 'step2', 'step3', 'step4', 'step5', 'step6', 'step7']),
        text: z.string(),
      }))
      .mutation(async ({ input }) => {
        const supabase = createClient(ENV.surveySupabaseUrl, ENV.surveySupabaseAnonKey);

        const { data: existing } = await supabase
          .from("survey_submissions")
          .select(`id, ${input.stepKey}`)
          .eq("user_id", input.userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (!existing) throw new Error("신청 내역을 찾을 수 없습니다.");

        // 기존 파일 URL 배열 유지하면서 텍스트 교체
        const raw = (existing as Record<string, unknown>)[input.stepKey];
        let existingItems: string[] = [];
        if (typeof raw === 'string' && raw !== 'pending' && raw !== 'completed') {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) existingItems = parsed;
          } catch { existingItems = []; }
        }
        // 파일 URL만 유지 (text:: 항목 제거)
        const filesOnly = existingItems.filter(u => !u.startsWith('text::'));
        // 새 텍스트 추가
        const updatedData = input.text.trim()
          ? [...filesOnly, `text::${input.text}`]
          : filesOnly;

        const { error: updateErr } = await supabase
          .from("survey_submissions")
          .update({ [input.stepKey]: updatedData.length > 0 ? JSON.stringify(updatedData) : 'pending' })
          .eq("user_id", input.userId);

        if (updateErr) throw new Error("텍스트 저장에 실패했습니다.");
        return { success: true, data: updatedData };
      }),

    /**
     * 신청서 제출 - Supabase survey_submissions에 직접 저장 (userId + login_provider 포함)
     */
    submit: publicProcedure
      .input(z.object({
        userId: z.string(),          // soozip 로그인 사용자 ID
        name: z.string(),             // 닉네임
        loginProvider: z.enum(["kakao", "naver", "email"]),  // 로그인 방식
        stylingType: z.string(),      // 희망 스타일링 타입
        housingType: z.string().optional(),
        roomSize: z.string().optional(),
        budget: z.string().optional(),
        moveInDate: z.string().optional(),
        deadline: z.string().optional(),
        referenceNote: z.string().optional(),
        activities: z.array(z.string()).optional(),
        existingFurniture: z.array(z.string()).optional(),
        buyFurniture: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        // Service Role Key로 클라이언트 생성 (RLS 우회)
        const supabase = createClient(ENV.surveySupabaseUrl, ENV.surveySupabaseServiceRoleKey);

        // 이미 동일 userId로 신청한 내역이 있는지 확인
        const { data: existing } = await supabase
          .from("survey_submissions")
          .select("id")
          .eq("user_id", input.userId)
          .limit(1)
          .single();

        if (existing) {
          throw new Error("이미 신청서를 제출하셨습니다. 마이페이지에서 진행 현황을 확인해주세요.");
        }

        const { error } = await supabase
          .from("survey_submissions")
          .insert({
            user_id: input.userId,
            name: input.name,
            login_provider: input.loginProvider,
            styling_type: input.stylingType,
            housing_type: input.housingType ?? null,
            room_size: input.roomSize ?? null,
            budget: input.budget ?? null,
            move_in_date: input.moveInDate ?? null,
            deadline: input.deadline ?? null,
            reference_note: input.referenceNote ?? null,
            activities: input.activities ?? [],
            existing_furniture: input.existingFurniture ?? [],
            buy_furniture: input.buyFurniture ?? [],
            styling_state: 1,
          });

        if (error) {
          console.error("[survey.submit] Supabase 저장 오류:", error);
          throw new Error("신청서 저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }

        return { success: true };
      }),

    /**
     * 로그인 사용자 정보 동기화
     * - 로그인 후 기존 신청서(name 기반)에 user_id, login_provider 업데이트
     * - 닉네임이 변경된 경우 name 컬럼도 최신 닉네임으로 업데이트
     * - 이미 user_id가 있는 경우 name만 최신 닉네임으로 업데이트
     */
    syncUserInfo: publicProcedure
      .input(z.object({
        userId: z.string(),
        nickname: z.string(),
        loginProvider: z.enum(["kakao", "naver", "email"]),
      }))
      .mutation(async ({ input }) => {
        // Service Role Key로 클라이언트 생성 (RLS 우회)
        const supabase = createClient(ENV.surveySupabaseUrl, ENV.surveySupabaseServiceRoleKey);

        // 1) 이미 userId로 연결된 신청서가 있는지 확인
        const { data: existingByUserId } = await supabase
          .from("survey_submissions")
          .select("id, name, login_provider")
          .eq("user_id", input.userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (existingByUserId) {
          // 이미 연결된 신청서가 있으면 name과 login_provider만 최신값으로 업데이트
          const updates: Record<string, string> = {};
          if (existingByUserId.name !== input.nickname) {
            updates.name = input.nickname;
          }
          if (!existingByUserId.login_provider) {
            updates.login_provider = input.loginProvider;
          }
          if (Object.keys(updates).length > 0) {
            await supabase
              .from("survey_submissions")
              .update(updates)
              .eq("user_id", input.userId);
          }
          return { synced: true, action: "updated" };
        }

        // 2) userId가 없는 신청서 중 닉네임이 일치하는 것 찾기 (비로그인 신청자 연결)
        const { data: existingByName } = await supabase
          .from("survey_submissions")
          .select("id, name, user_id")
          .eq("name", input.nickname)
          .is("user_id", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (existingByName) {
          // 닉네임 일치하는 비로그인 신청서에 user_id와 login_provider 연결
          await supabase
            .from("survey_submissions")
            .update({
              user_id: input.userId,
              login_provider: input.loginProvider,
              name: input.nickname, // 닉네임으로 name 업데이트
            })
            .eq("id", existingByName.id);
          return { synced: true, action: "linked" };
        }

        // 3) 연결할 신청서 없음 (신규 사용자 또는 미신청)
        return { synced: false, action: "none" };
      }),
    /**
     * STEP 완료 처리 - 해당 step 컬럼을 'completed'로 업데이트
     * 마이페이지 스타일링 탭 진행 상태 UI와 동기화
     */
    completeStep: publicProcedure
      .input(z.object({
        userId: z.string(),
        stepKey: z.enum(['step1', 'step2', 'step3', 'step4', 'step5', 'step6', 'step7']),
      }))
      .mutation(async ({ input }) => {
        const supabase = createClient(ENV.surveySupabaseUrl, ENV.surveySupabaseServiceRoleKey);
        const { data: existing } = await supabase
          .from("survey_submissions")
          .select("id")
          .eq("user_id", input.userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        if (!existing) throw new Error("신청 내역을 찾을 수 없습니다.");
        const { error } = await supabase
          .from("survey_submissions")
          .update({ [input.stepKey]: 'completed' })
          .eq("id", (existing as { id: number }).id);
        if (error) throw new Error("STEP 완료 처리에 실패했습니다.");
        return { success: true };
      }),
  }),

  // ─── 가구 정보 입력 라우터 ────────────────────────────
  furnitureInfo: router({
    /**
     * 내 가구 정보 목록 조회
     */
    list: publicProcedure
      .input(z.object({ progressId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];

        return db.select().from(furnitureInfo)
          .where(eq(furnitureInfo.progressId, input.progressId))
          .orderBy(furnitureInfo.sortOrder);
      }),

    /**
     * 가구 정보 저장 (제품 링크 방식)
     */
    saveLink: publicProcedure
      .input(z.object({
        progressId: z.number(),
        userNickname: z.string(),
        productLink: z.string().url("올바른 URL을 입력해주세요"),
        productOption: z.string().max(200).optional(),
        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("데이터베이스 연결 오류");

        await db.insert(furnitureInfo).values({
          progressId: input.progressId,
          userNickname: input.userNickname,
          inputType: "link",
          productLink: input.productLink,
          productOption: input.productOption ?? null,
          sortOrder: input.sortOrder,
        });

        return { success: true };
      }),

    /**
     * 가구 정보 저장 (사진+사이즈 방식)
     */
    savePhoto: publicProcedure
      .input(z.object({
        progressId: z.number(),
        userNickname: z.string(),
        photoUrl: z.string(),
        productName: z.string().max(100).optional(),
        width: z.string().max(20).optional(),
        depth: z.string().max(20).optional(),
        height: z.string().max(20).optional(),
        notes: z.string().max(300).optional(),
        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("데이터베이스 연결 오류");

        await db.insert(furnitureInfo).values({
          progressId: input.progressId,
          userNickname: input.userNickname,
          inputType: "photo",
          photoUrl: input.photoUrl,
          productName: input.productName ?? null,
          width: input.width ?? null,
          depth: input.depth ?? null,
          height: input.height ?? null,
          notes: input.notes ?? null,
          sortOrder: input.sortOrder,
        });

        return { success: true };
      }),

    /**
     * 가구 사진 업로드 (S3)
     */
    uploadPhoto: publicProcedure
      .input(z.object({
        userNickname: z.string(),
        fileName: z.string(),
        fileBase64: z.string(), // base64 encoded
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const randomSuffix = Math.random().toString(36).slice(2, 8);
        const fileKey = `furniture-photos/${input.userNickname}/${Date.now()}-${randomSuffix}-${input.fileName}`;
        const buffer = Buffer.from(input.fileBase64, "base64");
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        return { url };
      }),

    /**
     * 가구 정보 삭제
     */
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("데이터베이스 연결 오류");

        await db.delete(furnitureInfo).where(eq(furnitureInfo.id, input.id));
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
