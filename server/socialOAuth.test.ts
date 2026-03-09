/**
 * 서버사이드 소셜 OAuth 콜백 라우트 테스트
 * - code 파라미터 없을 때 /login?error=... 로 리다이렉트 검증
 * - error 파라미터 있을 때 /login?error=... 로 리다이렉트 검증
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import { registerSocialOAuthRoutes } from "./socialOAuth";

// fetch 모킹
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// DB 모킹
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

function createTestApp() {
  const app = express();
  registerSocialOAuthRoutes(app);
  return app;
}

describe("소셜 OAuth 서버사이드 콜백", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.VITE_APP_BASE_URL = "https://soozipmall-xb7s4bud.manus.space";
  });

  describe("카카오 콜백 (/auth/callback/kakao)", () => {
    it("code 파라미터 없으면 /login?error=... 로 리다이렉트", async () => {
      const app = createTestApp();
      const res = await request(app).get("/auth/callback/kakao");
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain("/login?error=");
      expect(decodeURIComponent(res.headers.location)).toContain("인증 코드가 없습니다");
    });

    it("error 파라미터 있으면 /login?error=... 로 리다이렉트", async () => {
      const app = createTestApp();
      const res = await request(app).get("/auth/callback/kakao?error=access_denied");
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain("/login?error=");
      expect(decodeURIComponent(res.headers.location)).toContain("카카오 로그인이 취소");
    });

    it("카카오 토큰 교환 실패 시 /login?error=... 로 리다이렉트", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ error: "invalid_grant", error_description: "code not found" }),
      });

      const app = createTestApp();
      const res = await request(app).get("/auth/callback/kakao?code=invalid_code");
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain("/login?error=");
    });
  });

  describe("네이버 콜백 (/auth/callback/naver)", () => {
    it("code 파라미터 없으면 /login?error=... 로 리다이렉트", async () => {
      const app = createTestApp();
      const res = await request(app).get("/auth/callback/naver");
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain("/login?error=");
      expect(decodeURIComponent(res.headers.location)).toContain("인증 코드가 없습니다");
    });

    it("error 파라미터 있으면 /login?error=... 로 리다이렉트", async () => {
      const app = createTestApp();
      const res = await request(app).get("/auth/callback/naver?error=access_denied");
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain("/login?error=");
      expect(decodeURIComponent(res.headers.location)).toContain("네이버 로그인이 취소");
    });

    it("네이버 토큰 교환 실패 시 /login?error=... 로 리다이렉트", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ error: "invalid_grant" }),
      });

      const app = createTestApp();
      const res = await request(app).get("/auth/callback/naver?code=invalid_code");
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain("/login?error=");
    });
  });
});
