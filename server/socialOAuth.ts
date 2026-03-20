/**
 * 서버사이드 소셜 OAuth 콜백 라우트
 *
 * 카카오/네이버 OAuth 인증 후 리다이렉트되는 콜백을 서버에서 직접 처리합니다.
 * - 경로: /api/auth/callback/kakao, /api/auth/callback/naver
 * - /api/* 경로는 배포 환경(Cloudflare)에서 Express 서버로 직접 프록시됨
 * - iOS Safari, 모바일 브라우저 등에서 SPA 라우터가 code 파라미터를 놓치는 문제 해결
 * - 서버에서 토큰 교환 → 임시 토큰 발급 → 프론트엔드로 리다이렉트
 */

import type { Express, Request, Response } from "express";
import { SignJWT } from "jose";
import { ENV } from "./_core/env";
import { getDb } from "./db";
import { kakaoUsers, naverUsers, soozipUsers } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import {
  createAccessToken,
  createRefreshToken,
  syncToSupabase,
  getRefreshCookieOptions,
  REFRESH_TOKEN_COOKIE,
} from "./auth";

const JWT_SECRET = new TextEncoder().encode(ENV.cookieSecret || "soozip-secret-key-2024");

// 임시 토큰 생성 (소셜 신규 회원 - 약관 동의 전)
async function createTempToken(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("10m")
    .sign(JWT_SECRET);
}

// 앱 베이스 URL 가져오기
function getAppBaseUrl(): string {
  const envBase = process.env.VITE_APP_BASE_URL;
  if (envBase) return envBase.replace(/\/$/, "");
  return "";
}

export function registerSocialOAuthRoutes(app: Express) {
  /**
   * 카카오 OAuth 콜백
   * GET /api/auth/callback/kakao?code=...&state=...
   */
  app.get("/api/auth/callback/kakao", async (req: Request, res: Response) => {
    const code = req.query.code as string | undefined;
    const errorParam = req.query.error as string | undefined;

    // 에러 응답 처리 (사용자가 취소한 경우 등)
    if (errorParam) {
      console.error(`[카카오 OAuth] 에러 응답: ${errorParam}`);
      res.redirect(302, `/login?error=${encodeURIComponent("카카오 로그인이 취소되었습니다.")}`);
      return;
    }

    if (!code) {
      console.error("[카카오 OAuth] code 파라미터 없음");
      res.redirect(302, `/login?error=${encodeURIComponent("인증 코드가 없습니다.")}`);
      return;
    }

    try {
      const baseUrl = getAppBaseUrl();
      const redirectUri = `${baseUrl}/api/auth/callback/kakao`;

      // 1. 카카오 액세스 토큰 교환
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
        console.error(`[카카오 OAuth] 토큰 교환 실패: ${tokenRes.status} ${errBody}`);
        res.redirect(302, `/login?error=${encodeURIComponent("카카오 인증에 실패했습니다.")}`);
        return;
      }

      const tokenData = await tokenRes.json() as {
        access_token: string;
        error?: string;
        error_description?: string;
      };

      if (tokenData.error) {
        console.error(`[카카오 OAuth] 토큰 에러: ${tokenData.error} - ${tokenData.error_description}`);
        res.redirect(302, `/login?error=${encodeURIComponent(tokenData.error_description || tokenData.error)}`);
        return;
      }

      // 2. 카카오 사용자 정보 조회
      const userRes = await fetch("https://kapi.kakao.com/v2/user/me", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userRes.ok) {
        console.error(`[카카오 OAuth] 사용자 정보 조회 실패: ${userRes.status}`);
        res.redirect(302, `/login?error=${encodeURIComponent("사용자 정보를 가져올 수 없습니다.")}`);
        return;
      }

      const userData = await userRes.json() as {
        id: number;
        kakao_account?: {
          email?: string;
          profile?: { nickname?: string; profile_image_url?: string };
        };
      };

      const kakaoId = String(userData.id);
      const email = userData.kakao_account?.email ?? null;
      const profileImageUrl = userData.kakao_account?.profile?.profile_image_url ?? null;
      const kakaoNickname = userData.kakao_account?.profile?.nickname ?? null;

      // 3. DB에서 기존 회원 확인
      const db = await getDb();
      if (!db) {
        res.redirect(302, `/login?error=${encodeURIComponent("서버 오류가 발생했습니다.")}`);
        return;
      }

      // 통합 테이블에서 조회
      const existingUnified = await db.select().from(soozipUsers)
        .where(and(eq(soozipUsers.provider, "kakao"), eq(soozipUsers.providerId, kakaoId)))
        .limit(1);

      if (existingUnified.length > 0) {
        const u = existingUnified[0];
        await db.update(soozipUsers).set({ lastSignedIn: new Date() }).where(eq(soozipUsers.id, u.id));
        const accessToken = await createAccessToken({ id: u.id, nickname: u.nickname, provider: u.provider, role: u.role });
        const rawRefreshToken = await createRefreshToken(u.id);
        await syncToSupabase(u.id, u.nickname);
        res.cookie(REFRESH_TOKEN_COOKIE, rawRefreshToken, getRefreshCookieOptions(ENV.isProduction));
        const userPayload = encodeURIComponent(JSON.stringify({
          id: u.id, nickname: u.nickname, email: u.email ?? null,
          provider: "kakao", profileImageUrl: u.profileImageUrl ?? null, accessToken,
        }));
        res.redirect(302, `/auth/social-complete?user=${userPayload}`);
      } else {
        // 레거시 kakaoUsers 테이블에서 확인 (마이그레이션)
        const existingLegacy = await db.select().from(kakaoUsers).where(eq(kakaoUsers.kakaoId, kakaoId)).limit(1);
        if (existingLegacy.length > 0) {
          const leg = existingLegacy[0];
          await db.insert(soozipUsers).values({
            provider: "kakao", providerId: kakaoId, email: leg.email ?? null,
            nickname: leg.nickname, profileImageUrl: leg.profileImageUrl ?? null,
            termsAgreed: leg.termsAgreed, privacyAgreed: leg.privacyAgreed,
            marketingAgreed: leg.marketingAgreed, ageAgreed: leg.ageAgreed,
          });
          const migrated = await db.select().from(soozipUsers)
            .where(and(eq(soozipUsers.provider, "kakao"), eq(soozipUsers.providerId, kakaoId))).limit(1);
          const u = migrated[0];
          await db.update(kakaoUsers).set({ lastSignedIn: new Date() }).where(eq(kakaoUsers.kakaoId, kakaoId));
          const accessToken = await createAccessToken({ id: u.id, nickname: u.nickname, provider: u.provider, role: u.role });
          const rawRefreshToken = await createRefreshToken(u.id);
          await syncToSupabase(u.id, u.nickname);
          res.cookie(REFRESH_TOKEN_COOKIE, rawRefreshToken, getRefreshCookieOptions(ENV.isProduction));
          const userPayload = encodeURIComponent(JSON.stringify({
            id: u.id, nickname: u.nickname, email: u.email ?? null,
            provider: "kakao", profileImageUrl: u.profileImageUrl ?? null, accessToken,
          }));
          res.redirect(302, `/auth/social-complete?user=${userPayload}`);
        } else {
          // 신규 회원 - 임시 토큰 발급 후 약관 동의 화면으로
          const tempToken = await createTempToken({
            provider: "kakao", kakaoId, email, profileImageUrl, suggestedNickname: kakaoNickname,
          });
          res.redirect(302, `/auth/social-consent?provider=kakao&tempToken=${tempToken}`);
        }
      }
    } catch (error) {
      console.error("[카카오 OAuth] 처리 중 오류:", error);
      res.redirect(302, `/login?error=${encodeURIComponent("로그인 처리 중 오류가 발생했습니다.")}`);
    }
  });

  /**
   * 네이버 OAuth 콜백
   * GET /api/auth/callback/naver?code=...&state=...
   */
  app.get("/api/auth/callback/naver", async (req: Request, res: Response) => {
    const code = req.query.code as string | undefined;
    const errorParam = req.query.error as string | undefined;

    if (errorParam) {
      console.error(`[네이버 OAuth] 에러 응답: ${errorParam}`);
      res.redirect(302, `/login?error=${encodeURIComponent("네이버 로그인이 취소되었습니다.")}`);
      return;
    }

    if (!code) {
      console.error("[네이버 OAuth] code 파라미터 없음");
      res.redirect(302, `/login?error=${encodeURIComponent("인증 코드가 없습니다.")}`);
      return;
    }

    try {
      const baseUrl = getAppBaseUrl();
      const redirectUri = `${baseUrl}/api/auth/callback/naver`;

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
        }),
      });

      if (!tokenRes.ok) {
        const errBody = await tokenRes.text().catch(() => "unknown");
        console.error(`[네이버 OAuth] 토큰 교환 실패: ${tokenRes.status} ${errBody}`);
        res.redirect(302, `/login?error=${encodeURIComponent("네이버 인증에 실패했습니다.")}`);
        return;
      }

      const tokenData = await tokenRes.json() as {
        access_token: string;
        error?: string;
        error_description?: string;
      };

      if (tokenData.error) {
        console.error(`[네이버 OAuth] 토큰 에러: ${tokenData.error} - ${tokenData.error_description}`);
        res.redirect(302, `/login?error=${encodeURIComponent(tokenData.error_description || tokenData.error)}`);
        return;
      }

      // 2. 네이버 사용자 정보 조회
      const userRes = await fetch("https://openapi.naver.com/v1/nid/me", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userRes.ok) {
        console.error(`[네이버 OAuth] 사용자 정보 조회 실패: ${userRes.status}`);
        res.redirect(302, `/login?error=${encodeURIComponent("사용자 정보를 가져올 수 없습니다.")}`);
        return;
      }

      const userData = await userRes.json() as {
        response: {
          id: string;
          email?: string;
          nickname?: string;
          profile_image?: string;
          gender?: string;    // M/F
          birthday?: string;  // MM-DD
          age?: string;       // 연령대 (예: "20-29")
        };
      };

      const naverId = userData.response.id;
      const email = userData.response.email ?? null;
      const profileImageUrl = userData.response.profile_image ?? null;
      const naverNickname = userData.response.nickname ?? null;
      const gender = userData.response.gender ?? null;
      const birthday = userData.response.birthday ?? null;
      const age = userData.response.age ?? null;

      // 3. DB에서 기존 회원 확인
      const db = await getDb();
      if (!db) {
        res.redirect(302, `/login?error=${encodeURIComponent("서버 오류가 발생했습니다.")}`);
        return;
      }

      // 통합 테이블에서 조회
      const existingUnifiedNaver = await db.select().from(soozipUsers)
        .where(and(eq(soozipUsers.provider, "naver"), eq(soozipUsers.providerId, naverId)))
        .limit(1);

      if (existingUnifiedNaver.length > 0) {
        const u = existingUnifiedNaver[0];
        await db.update(soozipUsers).set({ lastSignedIn: new Date() }).where(eq(soozipUsers.id, u.id));
        const accessToken = await createAccessToken({ id: u.id, nickname: u.nickname, provider: u.provider, role: u.role });
        const rawRefreshToken = await createRefreshToken(u.id);
        await syncToSupabase(u.id, u.nickname);
        res.cookie(REFRESH_TOKEN_COOKIE, rawRefreshToken, getRefreshCookieOptions(ENV.isProduction));
        const userPayload = encodeURIComponent(JSON.stringify({
          id: u.id, nickname: u.nickname, email: u.email ?? null,
          provider: "naver", profileImageUrl: u.profileImageUrl ?? null, accessToken,
        }));
        res.redirect(302, `/auth/social-complete?user=${userPayload}`);
      } else {
        // 레거시 naverUsers 테이블에서 확인 (마이그레이션)
        const existingLegacy = await db.select().from(naverUsers).where(eq(naverUsers.naverId, naverId)).limit(1);
        if (existingLegacy.length > 0) {
          const leg = existingLegacy[0];
          await db.insert(soozipUsers).values({
            provider: "naver", providerId: naverId, email: leg.email ?? null,
            nickname: leg.nickname, profileImageUrl: leg.profileImageUrl ?? null,
            termsAgreed: leg.termsAgreed, privacyAgreed: leg.privacyAgreed,
            marketingAgreed: leg.marketingAgreed, ageAgreed: leg.ageAgreed,
          });
          const migrated = await db.select().from(soozipUsers)
            .where(and(eq(soozipUsers.provider, "naver"), eq(soozipUsers.providerId, naverId))).limit(1);
          const u = migrated[0];
          await db.update(naverUsers).set({ lastSignedIn: new Date() }).where(eq(naverUsers.naverId, naverId));
          const accessToken = await createAccessToken({ id: u.id, nickname: u.nickname, provider: u.provider, role: u.role });
          const rawRefreshToken = await createRefreshToken(u.id);
          await syncToSupabase(u.id, u.nickname);
          res.cookie(REFRESH_TOKEN_COOKIE, rawRefreshToken, getRefreshCookieOptions(ENV.isProduction));
          const userPayload = encodeURIComponent(JSON.stringify({
            id: u.id, nickname: u.nickname, email: u.email ?? null,
            provider: "naver", profileImageUrl: u.profileImageUrl ?? null, accessToken,
          }));
          res.redirect(302, `/auth/social-complete?user=${userPayload}`);
        } else {
          // 신규 회원 - 임시 토큰 발급 후 약관 동의 화면으로
          const tempToken = await createTempToken({
            provider: "naver", naverId, email, profileImageUrl,
            suggestedNickname: naverNickname, gender, birthday, age,
          });
          res.redirect(302, `/auth/social-consent?provider=naver&tempToken=${tempToken}`);
        }
      }
    } catch (error) {
      console.error("[네이버 OAuth] 처리 중 오류:", error);
      res.redirect(302, `/login?error=${encodeURIComponent("로그인 처리 중 오류가 발생했습니다.")}`);
    }
  });
}
